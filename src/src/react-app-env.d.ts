// src/react-app-env.d.ts
/// <reference types="react-scripts" />
declare namespace NodeJS {
    interface Timer {
      ref(): void;
      unref(): void;
    }
  }