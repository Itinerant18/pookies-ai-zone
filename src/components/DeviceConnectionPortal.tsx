import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faQrcode,
    faCircleNotch,
    faArrowRight,
    faWifi,
    faChevronDown,
    faKeyboard
} from '@fortawesome/free-solid-svg-icons';
import logo from '@/assets/s1.svg';

interface DeviceConnectionPortalProps {
    ipAddress: string;
    setIpAddress: (val: string) => void;
    port: string;
    setPort: (val: string) => void;
    isRetrying: boolean;
    handleConnect: () => void;
    startScan: () => void;
}

const DeviceConnectionPortal: React.FC<DeviceConnectionPortalProps> = ({
    ipAddress, setIpAddress,
    port, setPort,
    isRetrying,
    handleConnect,
    startScan,
}) => {
    const [showManual, setShowManual] = useState(false);

    return (
        <div className="min-h-screen font-sans flex flex-col relative overflow-hidden bg-white">

            {/* Header */}
            <header className="relative z-10 px-6 pt-10 pb-2 flex flex-col items-center">
                <img src={logo} alt="Hestia Logo" className="h-24 w-auto mb-3 drop-shadow-lg" />
                <h1 className="text-2xl font-bold text-[#1e293b] flex items-center gap-2">
                    🔥 Hestia Control
                </h1>
                <p className="text-sm text-[#5E6D85] mt-1 font-medium">Fire Alarm Control Panel</p>
            </header>

            <main className="relative z-10 px-6 pb-8 flex-1 flex flex-col max-w-md mx-auto w-full">

                {/* ═══════════════════════════════════
                    QR Scanner — Primary Action
                    ═══════════════════════════════════ */}
                <section className="mt-8 flex flex-col items-center">
                    <button
                        onClick={startScan}
                        className="w-full rounded-2xl border border-[#E6EAF0] bg-white text-[#1e293b] shadow-[0_4px_24px_rgba(94,109,133,0.10)] active:scale-[0.98] hover:shadow-[0_8px_32px_rgba(94,109,133,0.16)] hover:border-[#5E6D85]/30 transition-all relative overflow-hidden group"
                    >
                        <div className="px-6 py-10 flex flex-col items-center gap-5">
                            {/* Icon */}
                            <div
                                className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-inner"
                                style={{ background: 'linear-gradient(135deg, #85715eff 0%, #8f7b5dff 100%)' }}
                            >
                                <FontAwesomeIcon icon={faQrcode} className="text-3xl text-white" />
                            </div>

                            {/* Text */}
                            <div className="text-center">
                                <span className="text-lg font-bold text-[#1e293b] block">Scan QR Code</span>
                                <span className="text-sm text-[#5E6D85] mt-1 block">
                                    Point camera at your Hestia device
                                </span>
                            </div>

                            {/* Arrow indicator */}
                            <div className="flex items-center gap-2 text-xs font-semibold text-[#FF7A45] uppercase tracking-wider">
                                <span>Tap to scan</span>
                                <FontAwesomeIcon icon={faArrowRight} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>

                        {/* Bottom accent stripe */}
                        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #FF7A45, #FFB74D)' }} />
                    </button>

                    {/* QR format hint */}
                    {/* <p className="mt-3 text-[11px] text-[#94a3b8] text-center">
                        QR format: <span className="font-mono font-semibold text-[#5E6D85]">http://192.168.4.74:8085</span>
                    </p> */}
                </section>

                {/* ═══════════════════════════════════
                    Manual Connection — Fallback
                    ═══════════════════════════════════ */}
                <section className="mt-8">
                    <button
                        onClick={() => setShowManual(!showManual)}
                        className="w-full flex items-center group cursor-pointer"
                    >
                        <div className="flex-1 h-px bg-[#e2e8f0]" />
                        <span className="px-4 flex items-center gap-2 text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider group-hover:text-[#5E6D85] transition-colors">
                            <FontAwesomeIcon icon={faKeyboard} className="text-[10px]" />
                            Manual connection
                            <FontAwesomeIcon
                                icon={faChevronDown}
                                className={`text-[9px] transition-transform duration-300 ${showManual ? 'rotate-180' : ''}`}
                            />
                        </span>
                        <div className="flex-1 h-px bg-[#e2e8f0]" />
                    </button>

                    {/* Collapsible form */}
                    <div className={`overflow-hidden transition-all duration-400 ease-in-out ${showManual ? 'max-h-[400px] opacity-100 mt-5' : 'max-h-0 opacity-0 mt-0'}`}>
                        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-5 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[#5E6D85] uppercase tracking-wider ml-1">
                                    IP Address
                                </label>
                                <input
                                    type="text"
                                    value={ipAddress}
                                    onChange={(e) => setIpAddress(e.target.value)}
                                    className="w-full bg-white border border-[#e2e8f0] rounded-xl py-3 px-4 text-[#1e293b] text-base font-mono focus:outline-none focus:ring-2 focus:ring-[#FF7A45] focus:border-transparent transition-all placeholder:text-[#94a3b8]"
                                    placeholder="192.168.4.74"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[#5E6D85] uppercase tracking-wider ml-1">
                                    Port
                                </label>
                                <input
                                    type="text"
                                    value={port}
                                    onChange={(e) => setPort(e.target.value)}
                                    className="w-full bg-white border border-[#e2e8f0] rounded-xl py-3 px-4 text-[#1e293b] text-base font-mono focus:outline-none focus:ring-2 focus:ring-[#FF7A45] focus:border-transparent transition-all placeholder:text-[#94a3b8]"
                                    placeholder="8085"
                                />
                            </div>

                            <button
                                onClick={() => handleConnect()}
                                disabled={isRetrying}
                                className="w-full py-3.5 rounded-xl text-white font-bold text-base shadow-[0_4px_16px_rgba(94,109,133,0.25)] active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                style={{ background: 'linear-gradient(135deg, #5E6D85 0%, #4E5F78 100%)' }}
                            >
                                {isRetrying ? (
                                    <>
                                        <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" />
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        Connect
                                        <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </section>

                {/* WiFi tip */}
                <div className="mt-auto pt-6">
                    <div className="flex items-center gap-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3">
                        <FontAwesomeIcon icon={faWifi} className="text-[#5E6D85] text-sm" />
                        <p className="text-xs text-[#64748b]">
                            Your phone must be <span className="font-semibold text-[#1e293b]">connected to panel's wifi</span>.
                        </p>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default DeviceConnectionPortal;
