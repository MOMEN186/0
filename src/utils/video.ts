export function getFallbackServer(serversData: any) {
  if (!serversData || !Array.isArray(serversData)) {
    return { serverName: '', key: '' };
  }

  const defaultServer = serversData[0];
  if (!defaultServer) {
    return { serverName: '', key: '' };
  }

  return {
    serverName: defaultServer.name || '',
    key: defaultServer.data || ''
  };
}
