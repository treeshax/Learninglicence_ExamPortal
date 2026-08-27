import type { ProctorEvent } from '@/lib/exam';

export type ViolationType='FACE_MISSING'|'MULTIPLE_FACES'|'LOOKING_AWAY'|'AUDIO_DETECTED'|'SUSTAINED_SPEECH'|'FULLSCREEN_EXIT'|'SCREEN_SHARE_STOPPED'|'SCREEN_SHARE_CHANGED'|'INVALID_SCREEN_SHARE'|'TAB_SWITCH'|'WINDOW_BLUR';
export const STRICT_PROCTORING=true;
export const STRICT_FULLSCREEN=true;
const critical=new Set<ViolationType>(['FULLSCREEN_EXIT','MULTIPLE_FACES','SCREEN_SHARE_STOPPED','SCREEN_SHARE_CHANGED','INVALID_SCREEN_SHARE']);
export function violation(type:ViolationType,message:string,duration?:number,metadata?:Record<string,number>):ProctorEvent { return {id:crypto.randomUUID(),type,timestamp:new Date().toISOString(),duration,severity:critical.has(type)||type==='TAB_SWITCH'&&STRICT_PROCTORING?'critical':'warning',resolved:false,metadata:{...metadata,messageLength:message.length}}; }
export function endsTest(type:ViolationType){return critical.has(type)||(STRICT_PROCTORING&&type==='TAB_SWITCH');}
export const violationMessage:Record<ViolationType,string>={FACE_MISSING:'Candidate face was not visible.',MULTIPLE_FACES:'Multiple people were detected.',LOOKING_AWAY:'Candidate appeared to be looking away.',AUDIO_DETECTED:'Sustained audio activity was detected.',SUSTAINED_SPEECH:'Sustained speech-like audio was detected.',FULLSCREEN_EXIT:'Fullscreen mode was exited.',SCREEN_SHARE_STOPPED:'Screen sharing was stopped.',SCREEN_SHARE_CHANGED:'The shared screen source changed.',INVALID_SCREEN_SHARE:'Entire-screen sharing is required.',TAB_SWITCH:'The examination tab was no longer active.',WINDOW_BLUR:'The examination window lost focus.'};
