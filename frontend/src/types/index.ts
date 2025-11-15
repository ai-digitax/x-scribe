// Media Base API Schemas
export namespace MbaTypes {
    export interface BaseResponse<T> {
        success: boolean | null;
        data: T | null;
        errors: Array<{
            code: string;
            msg: string;
        }> | null;
    }

    export interface ResCreate {
        id: number;
        uuid: string;
        created_at: string;
        expires_at: string | null;
        is_public: boolean;
        source_filename: string;
        format: "mp4" | "mp3" | "wav";
        duration_secs: number;
        size_bytes: number;
        thumbnail_url: string | null;
        media_url: string;
    }
    
    export interface ResTranscribe {
        id: number;
        uuid: string;
        created_at: string;
        expires_at: string | null;
        is_public: boolean;
        source_filename: string;
        format: "mp4" | "mp3" | "wav";
        duration_secs: number;
        size_bytes: number;
        thumbnail_url: string | null;
        media_url: string;
        transcription: string | null;
        segments: Array<object> | null;
    }
    
    export type MediaBaseResponse = BaseResponse<ResCreate>;
    export type TranscribeResponse = BaseResponse<ResTranscribe>;
}
