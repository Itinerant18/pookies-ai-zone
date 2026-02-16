import { useLocalSearchParams, Redirect } from 'expo-router';

export default function ToolDetailRedirect() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id || id === 'undefined') {
    return <Redirect href="/" />;
  }

  return <Redirect href={`/?toolId=${id}`} />;
}
