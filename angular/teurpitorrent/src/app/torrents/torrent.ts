export interface Tracker {
    announce: string;
    id: number;
    scrape: string;
    sitename: string;
    tier: number;
  }
  
  export interface Torrent {
    activityDate: number;
    addedDate: number;
    downloadDir: string;
    error: number;
    errorString: string;
    eta: number;
    id: number;
    isFinished: boolean;
    isStalled: boolean;
    leftUntilDone: number;
    metadataPercentComplete: number;
    name: string;
    peersConnected: number;
    peersGettingFromUs: number;
    peersSendingToUs: number;
    percentDone: number;
    queuePosition: number;
    rateDownload: number;
    rateUpload: number;
    recheckProgress: number;
    seedRatioLimit: number;
    seedRatioMode: number;
    sizeWhenDone: number;
    status: number;
    totalSize: number;
    trackers: Tracker[];
    uploadRatio: number;
    uploadedEver: number;
    isSelected: boolean;
  }