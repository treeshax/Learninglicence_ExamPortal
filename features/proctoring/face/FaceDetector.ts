import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { FACE_CONFIG } from './faceConfig';
import type { FaceBox, FaceResult, HeadDirection } from './faceTypes';

/** Local MediaPipe processor. It consumes the app-owned video element only. */
export class FaceDetector {
  private landmarker: FaceLandmarker | null = null;
  private previous?: { x:number; y:number; size:number };

  async initialize() {
    if (this.landmarker) return;
    const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm');
    this.landmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: '/models/face_landmarker.task' }, runningMode: 'VIDEO', numFaces: FACE_CONFIG.maxFaces,
      minFaceDetectionConfidence: .6, minFacePresenceConfidence: .6, minTrackingConfidence: .6,
      outputFaceBlendshapes: true, outputFacialTransformationMatrixes: true,
    });
  }

  async detect(video:HTMLVideoElement):Promise<FaceResult> {
    if (!this.landmarker) throw Error('Face Landmarker has not been initialized');
    const start=performance.now(); const result=this.landmarker.detectForVideo(video,start); const landmarks=result.faceLandmarks??[];
    const faces=landmarks.map(points=>this.box(points)); let yaw=0,pitch=0;
    const matrix=result.facialTransformationMatrixes?.[0]?.data;
    if(matrix?.length>=16){yaw=Math.atan2(matrix[8],matrix[10])*180/Math.PI;pitch=Math.asin(Math.max(-1,Math.min(1,-matrix[9])))*180/Math.PI;}
    const movement=faces[0]?this.movement(faces[0]):0; let headDirection:HeadDirection='LOOKING_FORWARD';
    if(movement>FACE_CONFIG.movementThreshold)headDirection='FACE_MOVING';else if(yaw>FACE_CONFIG.yawThresholdDegrees)headDirection='LOOKING_LEFT';else if(yaw<-FACE_CONFIG.yawThresholdDegrees)headDirection='LOOKING_RIGHT';else if(pitch>FACE_CONFIG.pitchThresholdDegrees)headDirection='LOOKING_UP';else if(pitch<-FACE_CONFIG.pitchThresholdDegrees)headDirection='LOOKING_DOWN';
    return {faceCount:faces.length,faces,timestamp:Date.now(),processingTimeMs:performance.now()-start,headDirection,yaw,pitch,movement};
  }

  private box(points:{x:number;y:number}[]):FaceBox {const xs=points.map(point=>point.x),ys=points.map(point=>point.y);const xMin=Math.min(...xs),yMin=Math.min(...ys),xMax=Math.max(...xs),yMax=Math.max(...ys);return {xMin,yMin,width:xMax-xMin,height:yMax-yMin};}
  private movement(box:FaceBox){const current={x:box.xMin+box.width/2,y:box.yMin+box.height/2,size:Math.max(box.width,box.height)};const distance=this.previous?Math.hypot(current.x-this.previous.x,current.y-this.previous.y)/Math.max(this.previous.size,.01):0;this.previous=current;return distance;}
  dispose(){this.landmarker?.close();this.landmarker=null;this.previous=undefined;}
}
