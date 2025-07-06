export function getFallbackServer(serversData: any) {
  if (!serversData || !Array.isArray(serversData.sub)) {
    return { serverName: "", key: "" };
  }
  const defaultServer = serversData.sub[0];
  console.log(defaultServer);

  if (!defaultServer) {
    return { serverName: "", key: "" };
  }

  return {
    serverName: defaultServer.serverName || "",
    key: defaultServer.serverId.toString() || "",
  };
}
