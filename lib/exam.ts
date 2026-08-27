export type ExamStatus='NOT_STARTED'|'EXAM_RUNNING'|'PAUSED'|'COMPLETED';
export const PASSING_SCORE=12;
export type ProctorEvent={id:string;type:string;timestamp:string;severity:'info'|'warning'|'critical';resolved:boolean;duration?:number;metadata?:Record<string,number>};
export type ExamSession={id:string;status:ExamStatus;startedAt:number;durationMs:number;pausedAt?:number;questionStartedAt?:number;result?:'PASS'|'FAIL';answers:Record<string,number>;events:ProctorEvent[];sync:'synced'|'local'|'syncing';questionIndex:number};
const transitions: Record<ExamStatus, ExamStatus[]> = { NOT_STARTED:['EXAM_RUNNING'], EXAM_RUNNING:['PAUSED','COMPLETED'], PAUSED:['EXAM_RUNNING'], COMPLETED:[] };
export const transition=(from:ExamStatus,to:ExamStatus):ExamStatus=>transitions[from].includes(to)?to:from;
export const remaining=(session:ExamSession, now=Date.now()) => Math.max(0, session.durationMs-((session.status==='PAUSED'?(session.pausedAt??now):now)-session.startedAt));
