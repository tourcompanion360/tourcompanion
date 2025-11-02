import {
  unstable_scheduleCallback,
  unstable_IdlePriority,
  unstable_NormalPriority,
  unstable_UserBlockingPriority,
} from 'scheduler';

type SchedulerGlobals = Record<string, unknown> & {
  React?: Record<string, unknown>;
  ReactScheduler?: Record<string, unknown>;
  clearTimeout?: typeof clearTimeout;
};

const globalObj: SchedulerGlobals | undefined =
  typeof globalThis !== 'undefined' ? (globalThis as SchedulerGlobals) : undefined;

let initialized = false;

const initScheduler = () => {
  if (!globalObj || initialized) return;

  const schedulerApi = {
    unstable_scheduleCallback,
    unstable_cancelCallback: (...args: Parameters<typeof clearTimeout>) => {
      if (typeof globalObj?.clearTimeout === 'function') {
        globalObj.clearTimeout(...args);
      }
    },
    unstable_IdlePriority,
    unstable_NormalPriority,
    unstable_UserBlockingPriority,
  } as const;

  globalObj.React = {
    ...(globalObj.React || {}),
    ...schedulerApi,
  };

  globalObj.ReactScheduler = {
    ...(globalObj.ReactScheduler || {}),
    ...schedulerApi,
  };

  initialized = true;
};

initScheduler();

export {}; // Ensure this module is treated as a module by bundlers
