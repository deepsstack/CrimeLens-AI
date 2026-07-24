/**
 * utils/webSpeechRecognition.ts
 * CrimeLens AI — Web Speech Recognition Utility
 *
 * Provides a platform-aware wrapper around the browser Web Speech API
 * (window.SpeechRecognition || window.webkitSpeechRecognition).
 *
 * Guaranteed safe for native platforms (Platform.OS !== 'web').
 */

import { Platform } from "react-native";
import type { Lang } from "../i18n/investigationTranslations";

// ── TypeScript global declarations for Web Speech API ────────────────────────

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export type WebSpeechOptions = {
  lang: Lang;
  onStart?: () => void;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onEnd?: () => void;
  onError?: (errorType: string, message: string) => void;
};

export class WebSpeechRecognizer {
  private recognition: any = null;
  private isListening: boolean = false;

  /**
   * Checks if browser speech recognition is supported on the current platform.
   */
  public static isSupported(): boolean {
    if (Platform.OS !== "web" || typeof window === "undefined") {
      return false;
    }
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  /**
   * Starts a new Web Speech API recognition session.
   */
  public start(options: WebSpeechOptions): boolean {
    if (!WebSpeechRecognizer.isSupported()) {
      const unsupportedMsg =
        options.lang === "kn"
          ? "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ."
          : "Voice input is not supported in this browser. Please type your query.";
      options.onError?.("unsupported", unsupportedMsg);
      return false;
    }

    try {
      this.stop(); // Clean up any active session first

      const SpeechRecognitionClass =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      const recognition = new SpeechRecognitionClass();
      this.recognition = recognition;

      // Select speech recognition language (en-IN or kn-IN)
      recognition.lang = options.lang === "kn" ? "kn-IN" : "en-IN";
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        this.isListening = true;
        options.onStart?.();
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        let isFinal = false;

        if (event.results) {
          for (let i = 0; i < event.results.length; i++) {
            const item = event.results[i];
            if (item && item[0]) {
              transcript += item[0].transcript;
              if (item.isFinal) {
                isFinal = true;
              }
            }
          }
        }

        options.onResult?.(transcript, isFinal);
      };

      recognition.onend = () => {
        this.isListening = false;
        this.recognition = null;
        options.onEnd?.();
      };

      recognition.onerror = (event: any) => {
        this.isListening = false;
        const err = event.error || "unknown";

        // "aborted" happens when user or code stops listening intentionally
        if (err === "aborted") {
          return;
        }

        let userMsg = "";
        if (err === "not-allowed" || err === "service-not-allowed") {
          userMsg =
            options.lang === "kn"
              ? "ಧ್ವನಿ ಇನ್‌ಪುಟ್‌ಗೆ ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ಅಗತ್ಯವಿದೆ. ನೀವು ಪಠ್ಯ ಪ್ರಶ್ನೆಗಳನ್ನು ಬಳಸುವುದನ್ನು ಮುಂದುವರಿಸಬಹುದು."
              : "Microphone permission is required for voice input. You can continue using text queries.";
        } else if (err === "no-speech") {
          userMsg =
            options.lang === "kn"
              ? "ಯಾವುದೇ ಧ್ವನಿ ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
              : "No speech detected. Please try again.";
        } else {
          userMsg =
            options.lang === "kn"
              ? "ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆಯಲ್ಲಿ ದೋಷ ಉಂಟಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ."
              : "Speech recognition error. Please try again or type your query.";
        }

        options.onError?.(err, userMsg);
      };

      recognition.start();
      return true;
    } catch (err: any) {
      this.isListening = false;
      this.recognition = null;
      const fallbackMsg =
        options.lang === "kn"
          ? "ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆಯನ್ನು ಪ್ರಾರಂಭಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
          : "Unable to start voice input. Please try again.";
      options.onError?.("start-failed", fallbackMsg);
      return false;
    }
  }

  /**
   * Stops active Web Speech API recognition session.
   */
  public stop(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // Ignore error if already stopped
      }
      this.recognition = null;
    }
    this.isListening = false;
  }

  /**
   * Returns current listening status.
   */
  public getIsListening(): boolean {
    return this.isListening;
  }
}

export const webSpeechRecognizer = new WebSpeechRecognizer();
