declare module 'mammoth' {
  export interface MammothOptions {
    styleMap?: string[];
    includeDefaultStyleMap?: boolean;
    convertImage?: (image: MammothImage) => Promise<MammothImageConversion>;
  }

  export interface MammothImage {
    read: () => Promise<Buffer>;
    contentType: string;
  }

  export interface MammothImageConversion {
    src: string;
    alt?: string;
  }

  export interface MammothResult {
    value: string; // The converted HTML or Markdown
    messages: string[]; // Any messages, warnings, or errors
  }

  export function convertToHtml(
    input: { path: string } | { buffer: Buffer },
    options?: MammothOptions
  ): Promise<MammothResult>;

  export function convertToMarkdown(
    input: { path: string } | { buffer: Buffer },
    options?: MammothOptions
  ): Promise<MammothResult>;

  export const styles: {
    NORMAL: string;
    HEADING_1: string;
    HEADING_2: string;
    HEADING_3: string;
  };
}
