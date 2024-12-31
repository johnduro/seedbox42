export interface Settings {
    transmission: TransmissionConfiguration;
    'transmission-settings': TransmissionSettings;
    torrents: TorrentsSettings;
    files: FilesSettings;
    dashboard: DashboardSettings;
    users: UsersSettings;
  }

  export interface TransmissionConfiguration {
    address: string;
    port: number;
    url: string;
  }

  export interface TransmissionSettings {
    'alt-speed-down': number;
    'alt-speed-enabled': boolean;
    'alt-speed-time-begin': number;
    'alt-speed-time-day': number;
    'alt-speed-time-enabled': boolean;
    'alt-speed-time-end': number;
    'alt-speed-up': number;
    'blocklist-enabled': boolean;
    'blocklist-url': string;
    'cache-size-mb': number;
    'dht-enabled': boolean;
    'download-queue-enabled': boolean;
    'download-queue-size': number;
    encryption: string;
    'idle-seeding-limit': number;
    'idle-seeding-limit-enabled': boolean;
    'lpd-enabled': boolean;
    'peer-limit-global': number;
    'peer-limit-per-torrent': number;
    'peer-port': number;
    'peer-port-random-on-start': boolean;
    'pex-enabled': boolean;
    'port-forwarding-enabled': boolean;
    'queue-stalled-enabled': boolean;
    'queue-stalled-minutes': number;
    'rename-partial-files': boolean;
    'script-torrent-done-enabled': boolean;
    'script-torrent-done-filename': string;
    'seed-queue-enabled': boolean;
    'seed-queue-size': number;
    seedRatioLimit: number;
    seedRatioLimited: boolean;
    'speed-limit-down': number;
    'speed-limit-down-enabled': boolean;
    'speed-limit-up': number;
    'speed-limit-up-enabled': boolean;
    'start-added-torrents': boolean;
    'trash-original-torrent-files': boolean;
    'utp-enabled': boolean;
  }

  export interface TorrentsSettings {
    'add-torrent-enabled': boolean;
    'delete-torrent-enabled': boolean;
  }

  export interface FilesSettings {
    'show-creator': string;
    'lock-enabled': string;
    'comments-enabled': string;
    'grades-enabled': string;
    'auto-remove-lock-enabled': boolean;
    'auto-remove-lock': number;
    'auto-delete-enabled': boolean;
    'auto-delete': number;
  }

  export interface DashboardSettings {
    panels: Panel[];
    'file-number-exhibit': number;
    'mini-chat-message-limit': number;
  }

  export interface Panel {
    name: string;
    enabled: string;
    template: string;
    title: string;
    order: number;
  }

  export interface UsersSettings {
    'show-connected': string;
    'default-avatar': string;
  }