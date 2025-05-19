export type EventType<T> = {
  name: string;
  data: T;
};

export type MessageToServer =
  | {
      name: "playerJoinRoom";
      data: {
        captchaToken: string;
      };
    }
  | {
      name: "messageSentByUser";
      data: {
        message: string;
        isDay: boolean;
      };
    }
  | {
      name: "handleVote";
      data: {
        recipient: number | null;
        isDay: boolean;
      };
    }
  | {
      name: "handleVisit";
      data: {
        recipient: number | null;
        isDay: boolean;
      };
    }
  | {
      name: "handleWhisper";
      data: {
        recipient: number;
        message: string;
        isDay: boolean;
      };
    };

export type ClientToServerEvents = {
  playerJoinRoom: (
    captchaToken: string,
    cb: (result: string | number) => void,
  ) => Promise<void>;
  disconnect: () => void;
  messageSentByUser: (message: string, isDay: boolean) => void;
  handleVote: (recipient: number | null, isDay: boolean) => void;
  handleVisit: (recipient: number | null, isDay: boolean) => void;
  handleWhisper: (recipient: number, message: string, isDay: boolean) => void;
};

type PlayerList = {
  name: string;
  isAlive: boolean | undefined;
  role: string;
};

type PlayerReturned = {
  name: string;
  role: string;
  dayVisitSelf: boolean;
  dayVisitOthers: boolean;
  dayVisitFaction: boolean;
  nightVisitSelf: boolean;
  nightVisitOthers: boolean;
  nightVisitFaction: boolean;
  nightVote: boolean;
};

type SvrMsg = {
  name: keyof ServerToClientEvents;
};
export type MessageToClient =
  | {
      name: "receiveMessage";
      data: {
        message: string;
      };
    }
  | {
      name: "blockMessages";
    }
  | {
      name: "receive-new-player";
      data: {
        player: { name: string };
      };
    }
  | {
      name: "remove-player";
      data: {
        player: { name: string };
      };
    }
  | {
      name: "receive-player-list";
      data: {
        playerList: PlayerList[];
      };
    }
  | {
      name: "receive-chat-message";
      data: {
        message: string;
      };
    }
  | {
      name: "receive-whisper-message";
      data: {
        message: string;
      };
    }
  | {
      name: "update-day-time";
      data: {
        time: string;
        dayNumber: number;
        timeLeft: number;
      };
    }
  | {
      name: "disable-voting";
    }
  | {
      name: "update-player-role";
      data: {
        name: string;
        role?: string;
      };
    }
  | {
      name: "assign-player-role";
      data: PlayerReturned;
    }
  | {
      name: "update-faction-role";
      data: {
        name: string;
        role: string;
      };
    }
  | {
      name: "receive-role";
      data: {
        role: string;
      };
    }
  | {
      name: "update-player-visit";
    };

export type ServerToClientEvents = {
  //receive-message
  receiveMessage: (message: string) => void;
  blockMessages: () => void;
  "receive-new-player": (player: { name: string }) => void;
  "remove-player": (player: { name: string }) => void;
  "receive-player-list": (playerList: PlayerList[]) => void;
  "receive-chat-message": (message: string) => void;
  "receive-whisper-message": (message: string) => void;
  "update-day-time": (data: {
    time: string;
    dayNumber: number;
    timeLeft: number;
  }) => void;
  "disable-voting": () => void;
  "update-player-role": (data: { name: string; role?: string }) => void;
  "assign-player-role": (data: PlayerReturned) => void;
  "update-faction-role": (data: { name: string; role: string }) => void;
  "receive-role": (role: string) => void;
  "update-player-visit": () => void;
};
