declare global {
  interface Window {
    MemberSpace: MemberSpaceAPI;
  }
}

type MemberSpaceAPI = {
  getMemberInfo: (...args: any[]) => Promise<any>;
  getMemberMetadata: (...args: any[]) => Promise<any>;
  setLogTopic: (...args: any[]) => Promise<any>;
  clearMemberMetadata: (...args: any[]) => Promise<any>;
  updateMemberMetadata: (data: { videoTracker: VideoTracker }) => Promise<any>;
};

type VideoTracker = {
  [courseId: string]: {
    [videoId: string]: {
      hasBeenViewed: boolean;
    };
  };
};

export async function memberSpaceReady() {
  let memberSpaceInitialized = false;
  let counter = 0;
  const MAX_INTERVALS = 100;
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      if (!memberSpaceInitialized) {
        memberSpaceInitialized = Object.prototype.hasOwnProperty.call(window.MemberSpace, "getMemberMetadata");

        if (++counter >= MAX_INTERVALS) {
          reject("Could not load window.MemberSpace");
          clearInterval(interval);
        }
      } else {
        resolve("window.MemberSpace ready");
        clearInterval(interval);
      }
    }, 100);
  });
}

export async function updateVideoTracker(
  MemberSpace: Window["MemberSpace"],
  { videoId, courseId }: { videoId: string; courseId: string },
  data: {
    hasBeenViewed: boolean;
  },
) {
  await MemberSpace.updateMemberMetadata({
    videoTracker: {
      [courseId]: {
        [videoId]: data,
      },
    },
  });
}
