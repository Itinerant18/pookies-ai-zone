import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faQrcode,
  faTimes,
  faExclamationTriangle,
  faArrowLeft,
  faRedo,
} from '@fortawesome/free-solid-svg-icons';
import DeviceConnectionPortal from './components/DeviceConnectionPortal';
import { Html5Qrcode } from 'html5-qrcode';

const HestiaControlPanel = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [espUrl, setEspUrl] = useState('');
  const [ipAddress, setIpAddress] = useState('192.168.4.74');
  const [port, setPort] = useState('8085');
  const [isRetrying, setIsRetrying] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const iframeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => { });
      }
      if (iframeTimerRef.current) {
        clearTimeout(iframeTimerRef.current);
      }
    };
  }, []);

  // Start html5-qrcode scanner
  const startScan = () => {
    setIsScanning(true);
  };

  // Initialize scanner when scanning view mounts
  useEffect(() => {
    if (!isScanning) return;

    const initScanner = async () => {
      try {
        const html5Qrcode = new Html5Qrcode('qr-reader');
        scannerRef.current = html5Qrcode;

        await html5Qrcode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            handleQrResult(decodedText);
          },
          () => {
            // QR code not detected — ignore
          }
        );
      } catch (err) {
        console.error('Camera error:', err);
        alert('Unable to access camera. Please check camera permissions.');
        stopScan();
      }
    };

    const timer = setTimeout(initScanner, 300);
    return () => clearTimeout(timer);
  }, [isScanning]);

  const handleQrResult = (rawValue: string) => {
    // Validate HESTIA:IP:PORT format
    if (!rawValue.startsWith('http')) {
      stopScan();
      showError(
        'Invalid QR code scanned.\n\nExpected format:\nhttp://IP_ADDRESS:PORT\n\nExample: http://192.168.4.74:8085'
      );
      return;
    }

    const parts = rawValue.split(':');
    if (parts.length !== 3 || !parts[1] || !parts[2]) {
      stopScan();
      showError(
        'Invalid QR code format.\n\nExpected: http://IP_ADDRESS:PORT\nGot: ' + rawValue
      );
      return;
    }

    const scannedIp = parts[1];
    const scannedPort = parts[2];

    setIpAddress(scannedIp);
    setPort(scannedPort);

    // Auto-connect after short delay
    setTimeout(() => {
      stopScan();
      connectToDevice(scannedIp, scannedPort);
    }, 500);
  };

  const stopScan = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        // Ignore stop errors
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setHasError(true);
    setIsConnected(false);
    setEspUrl('');
  };

  const connectToDevice = async (ip: string, p: string) => {
    // Basic validation
    const ipPattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    if (!ipPattern.test(ip)) {
      showError('Invalid IP address: ' + ip + '\n\nPlease enter a valid IPv4 address\n(e.g. 192.168.4.74)');
      return;
    }

    const portNum = parseInt(p, 10);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      showError('Invalid port: ' + p + '\n\nPort must be between 1 and 65535');
      return;
    }

    const url = 'http://' + ip + ':' + p;

    // Show loading state
    setEspUrl(url);
    setHasError(false);
    setErrorMessage('');
    setIframeLoading(true);
    setIsConnected(true);

    // Try to reach the device first
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      await fetch(url, {
        method: 'GET',
        mode: 'no-cors',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Device is reachable — iframe will load
      // Set a fallback timeout in case iframe doesn't fire onLoad
      iframeTimerRef.current = setTimeout(() => {
        setIframeLoading(false);
      }, 8000);
    } catch {
      // Device unreachable — show error page
      showError(
        'Could not reach the device at:\n' +
        url +
        '\n\nPlease check:\n• The device is powered on \n• Your phone is connected to the panel\'s WiFi\n• If Entered Manually, the IP address and port are correct'
      );
    }
  };

  const handleIframeLoad = () => {
    if (iframeTimerRef.current) {
      clearTimeout(iframeTimerRef.current);
    }
    setIframeLoading(false);
  };

  const handleIframeError = () => {
    if (iframeTimerRef.current) {

      clearTimeout(iframeTimerRef.current);
    }
    showError(
      'Could not reach the ESP32 web server at:\n' +
      espUrl +
      '\n\nPlease check:\n• The IP address and port are correct\n• Your phone is on the same WiFi\n• The ESP32 device is powered on'
    );
  };

  const handleConnect = () => {
    if (!ipAddress || !port) {
      showError('Please enter both IP address and port.');
      return;
    }

    setIsRetrying(true);
    setTimeout(() => {
      connectToDevice(ipAddress, port);
      setIsRetrying(false);
    }, 300);
  };

  const handleDisconnect = () => {
    const confirmed = window.confirm('Disconnect from Hestia device?');
    if (confirmed) {
      setEspUrl('');
      setIsConnected(false);
      setHasError(false);
      setErrorMessage('');
    }
  };

  const goBack = () => {
    setHasError(false);
    setErrorMessage('');
    setIsConnected(false);
    setEspUrl('');
  };

  // ═══════════════════════════════
  // Screen: QR Scanner Modal
  // ═══════════════════════════════
  if (isScanning) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="bg-black/80 px-6 pt-10 pb-4 text-center">
          <h2 className="text-white text-xl font-bold flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faQrcode} className="text-white/80" />
            Scan QR Code
          </h2>
          <p className="text-gray-400 text-sm mt-2">Point camera at Hestia device QR code</p>
        </div>

        <div className="flex-1 relative flex items-center justify-center bg-black">
          <div id="qr-reader" className="w-full max-w-sm" />
        </div>

        <div className="bg-black/80 px-6 py-5">
          <button
            onClick={stopScan}
            className="w-full py-4 rounded-xl bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold text-lg shadow-lg active:scale-[0.97] transition-all flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faTimes} />
            Close Scanner
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════
  // Screen: Error State
  // ═══════════════════════════════
  if (hasError) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50 p-6">
        <div className="w-full max-w-sm text-center">
          {/* Error icon */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#fef2f2] border-2 border-[#fecaca]">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-3xl text-[#ef4444]" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-[#1e293b] mb-3">Connection Failed</h2>

          <p className="text-sm text-[#5E6D85] whitespace-pre-line leading-relaxed mb-8 px-2">
            {errorMessage}
          </p>

          <div className="space-y-3">
            <button
              onClick={() => {
                setHasError(false);
                setErrorMessage('');
                connectToDevice(ipAddress, port);
              }}
              className="w-full py-3.5 rounded-xl text-white font-bold text-base active:scale-[0.97] transition-all flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #FF7A45 0%, #FFB74D 100%)' }}
            >
              <FontAwesomeIcon icon={faRedo} />
              Retry Connection
            </button>

            <button
              onClick={goBack}
              className="w-full py-3.5 rounded-xl font-bold text-base text-[#5E6D85] bg-[#f1f5f9] hover:bg-[#e2e8f0] active:scale-[0.97] transition-all flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Back to Setup
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════
  // Screen: Connected — ESP32 Webserver
  // ═══════════════════════════════
  if (isConnected && espUrl) {
    return (
      <div className="fixed inset-0 flex flex-col overflow-hidden">
        {/* Dark Top Bar */}
        <div className="flex-none bg-[#2c3e50] text-white px-4 py-3 shadow-lg z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-60" />
                <div className="relative w-3 h-3 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
              </div>
              <span className="text-base font-bold">Hestia Panel</span>
            </div>

            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-[#ef4444] hover:bg-[#dc2626] rounded-lg text-sm font-bold transition-all active:scale-[0.95]"
            >
              Disconnect
            </button>
          </div>
        </div>

        {/* Full Screen iframe */}
        <div className="flex-1 relative">
          {iframeLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-[#e2e8f0] border-t-[#FF7A45] rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-[#5E6D85] font-medium">Connecting to device...</p>
                <p className="text-xs text-[#94a3b8] mt-1 font-mono">{espUrl}</p>
              </div>
            </div>
          )}
          <iframe
            src={espUrl}
            className="w-full h-full border-none"
            title="ESP32 Web Server"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        </div>
      </div>
    );
  }

  // ═══════════════════════════════
  // Screen: Connection Portal
  // ═══════════════════════════════
  return (
    <DeviceConnectionPortal
      ipAddress={ipAddress}
      setIpAddress={setIpAddress}
      port={port}
      setPort={setPort}
      isRetrying={isRetrying}
      handleConnect={handleConnect}
      startScan={startScan}
    />
  );
};

export default HestiaControlPanel;