import { Constants } from 'librechat-data-provider';
import type * as t from './types';

export const mcpToolPattern = new RegExp(`^.+${Constants.mcp_delimiter}.+$`);

export function determineServerType(serverConfig: t.MCPOptions): string {
  if ('command' in serverConfig) {
    return 'stdio';
  }

  if (!('url' in serverConfig)) {
    return 'unknown';
  }

  const protocol = new URL(serverConfig.url).protocol;
  if (protocol === 'ws:' || protocol === 'wss:') {
    return 'websocket';
  }

  if ('type' in serverConfig) {
    const optionType = serverConfig.type as string;
    if (optionType === 'streamable-http' || optionType === 'http') {
      return 'streamable-http';
    }
  }

  return 'sse';
}
/**
 * Normalizes a server name to match the pattern ^[a-zA-Z0-9_.-]+$
 * This is required for Azure OpenAI models with Tool Calling
 */
export function normalizeServerName(serverName: string): string {
  // Check if the server name already matches the pattern
  if (/^[a-zA-Z0-9_.-]+$/.test(serverName)) {
    return serverName;
  }

  /** Replace non-matching characters with underscores.
    This preserves the general structure while ensuring compatibility. 
    Trims leading/trailing underscores
    */
  const normalized = serverName.replace(/[^a-zA-Z0-9_.-]/g, '_').replace(/^_+|_+$/g, '');

  // If the result is empty (e.g., all characters were non-ASCII and got trimmed),
  // generate a fallback name to ensure we always have a valid function name
  if (!normalized) {
    /** Hash of the original name to ensure uniqueness */
    let hash = 0;
    for (let i = 0; i < serverName.length; i++) {
      hash = (hash << 5) - hash + serverName.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return `server_${Math.abs(hash)}`;
  }

  return normalized;
}
