export type FaceStatus = 'NO_FACE' | 'SINGLE_FACE' | 'MULTIPLE_FACES_PENDING' | 'MULTIPLE_FACES_CONFIRMED' | 'ERROR';
export type HeadDirection='LOOKING_FORWARD'|'LOOKING_LEFT'|'LOOKING_RIGHT'|'LOOKING_UP'|'LOOKING_DOWN'|'FACE_MOVING';
export type FaceBox = { xMin:number; yMin:number; width:number; height:number };
export type FaceResult = { faceCount:number; faces:FaceBox[]; timestamp:number; processingTimeMs:number; headDirection:HeadDirection; yaw:number; pitch:number; movement:number };
export type FaceSnapshot = FaceResult & { status:FaceStatus; pendingMs:number; fps:number; noFaceDurationMs:number; error?:string };
