'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProctoredCamera from '@/components/ProctoredCamera';
import ScreenProctor, { type ScreenInfo } from '@/components/ScreenProctor';
import { questions } from '@/lib/questions';
import { saveSession } from '@/lib/store';
import { PASSING_SCORE, type ExamSession, type ProctorEvent } from '@/lib/exam';
import type { FaceResult, FaceSnapshot } from '@/features/proctoring/face/faceTypes';
import type { AudioEventType, AudioMetrics } from '@/features/proctoring/audio/audioTypes';
import { endsTest, STRICT_FULLSCREEN, violation, violationMessage, type ViolationType } from '@/features/proctoring/ViolationManager';

type Props={session:ExamSession|null;setSession:(value:ExamSession)=>void;now:number;offline:boolean;setOffline:(value:boolean)=>void;addEvent:(type:string,severity?:ProctorEvent['severity'])=>void;finish:()=>void};

export default function Exam({session,setSession,now,offline,setOffline,finish}:Props){
  const router=useRouter(); const [screen,setScreen]=useState<ScreenInfo>(); const [face,setFace]=useState<FaceSnapshot>();
  const [fullscreen,setFullscreen]=useState(false); const [started,setStarted]=useState(false); const [notice,setNotice]=useState(''); const [terminated,setTerminated]=useState(''); const ended=useRef(false);
  const [selectedOption,setSelectedOption]=useState<number|null>(null);

  const persist=useCallback((next:ExamSession)=>{setSession(next);void saveSession(next);},[setSession]);
  const endTest=useCallback((type:ViolationType)=>{if(!session||ended.current)return;ended.current=true;const event=violation(type,violationMessage[type]);persist({...session,status:'COMPLETED',result:'FAIL',events:[...session.events,event]});setTerminated(event.type);},[persist,session]);
  const report=useCallback((type:ViolationType)=>{if(endsTest(type))endTest(type);else if(session)persist({...session,events:[...session.events,violation(type,violationMessage[type])]});},[endTest,persist,session]);
  const recordMultiple=useCallback((result:FaceResult)=>{if(!session)return;persist({...session,events:[...session.events,violation('MULTIPLE_FACES',violationMessage.MULTIPLE_FACES,undefined,{faceCount:result.faceCount})]});endTest('MULTIPLE_FACES');},[endTest,persist,session]);
  const recordAudio=useCallback((type:AudioEventType,metrics?:AudioMetrics,duration?:number)=>{if(!session)return;const severe=type==='SUSTAINED_SPEECH'||type==='REPEATED_SPEECH';const event:ProctorEvent={id:crypto.randomUUID(),type,timestamp:new Date().toISOString(),severity:severe?'warning':'info',resolved:false,duration,metadata:metrics?{rms:metrics.rms,peak:metrics.peak,noiseFloor:metrics.noiseFloor,zeroCrossings:metrics.zeroCrossings}:undefined};persist({...session,events:[...session.events,event]});if(severe)setNotice('Audio activity detected. Please remain silent during the examination.');},[persist,session]);
  const onScreenViolation=useCallback((type:'SCREEN_SHARE_STOPPED'|'SCREEN_SHARE_CHANGED'|'INVALID_SCREEN_SHARE')=>{if(!started){if(type==='INVALID_SCREEN_SHARE')setNotice('Invalid screen sharing. Please share your entire screen to start.');else if(type==='SCREEN_SHARE_STOPPED'){setNotice('Screen sharing was stopped. Please share your entire screen to start.');setScreen(undefined);}else if(type==='SCREEN_SHARE_CHANGED'){setNotice('Screen sharing source changed. Please share your entire screen to start.');setScreen(undefined);}return;}report(type);},[report,started]);
  const enterFullscreenAndStart=async()=>{if(!screen||face?.faceCount!==1){setNotice('Complete camera, microphone, exactly-one-face, and entire-screen-sharing checks before starting.');return;}try{await document.documentElement.requestFullscreen();if(!document.fullscreenElement)throw Error();setFullscreen(true);setStarted(true);persist({...session!,questionStartedAt:Date.now()});}catch{setNotice('Fullscreen mode could not be activated. Use a supported browser and try again.');}};
  useEffect(()=>{const change=()=>{const active=Boolean(document.fullscreenElement);setFullscreen(active);if(started&&!active){if(STRICT_FULLSCREEN)endTest('FULLSCREEN_EXIT');else setNotice('Fullscreen required. The examination is paused until fullscreen is restored.');}};document.addEventListener('fullscreenchange',change);return()=>document.removeEventListener('fullscreenchange',change);},[started,endTest]);
  useEffect(()=>{if(!started||terminated)return;const lost=()=>{if(document.hidden)report('TAB_SWITCH');};document.addEventListener('visibilitychange',lost);return()=>document.removeEventListener('visibilitychange',lost);},[started,terminated,report]);

  // Automatic immediate termination when score reaches 12
  useEffect(()=>{
    if(!session||!started||terminated||ended.current||session.status==='COMPLETED')return;
    const currentScore=questions.filter(item=>session.answers[item.id]!==undefined&&session.answers[item.id]===item.correctAnswer).length;
    if(currentScore>=PASSING_SCORE){
      ended.current=true;
      persist({...session,status:'COMPLETED',result:'PASS'});
      finish();
    }
  },[session,started,terminated,persist,finish]);

  // 20-second per-question timer auto-advance
  useEffect(()=>{
    if(!session||!started||terminated||now-(session.questionStartedAt??now)<20000)return;
    const currentScore=questions.filter(q=>session.answers[q.id]!==undefined&&session.answers[q.id]===q.correctAnswer).length;
    if(currentScore>=PASSING_SCORE){
      ended.current=true;
      persist({...session,status:'COMPLETED',result:'PASS'});
      finish();
      return;
    }
    if(session.questionIndex===questions.length-1){
      const passed=currentScore>=PASSING_SCORE;
      ended.current=true;
      persist({...session,status:'COMPLETED',result:passed?'PASS':'FAIL'});
      finish();
    }else{
      persist({...session,questionIndex:session.questionIndex+1,questionStartedAt:Date.now()});
    }
  },[now,session,started,terminated,persist,finish]);

  const q=questions[session?.questionIndex??0];
  useEffect(()=>{
    if(session&&q){
      setSelectedOption(session.answers[q.id]??null);
    }
  },[session,q]);

  if(!session)return <main className="mx-auto max-w-lg px-5 py-16"><div className="card p-7"><h1 className="text-2xl font-bold">We found no active examination</h1><button onClick={()=>router.push('/instructions')} className="btn-primary mt-6">Go to instructions</button></div></main>;
  if(terminated)return <main className="mx-auto max-w-xl px-5 py-16"><div className="card border-2 border-red-500 p-8 text-center"><p className="font-bold text-red-700">TEST TERMINATED</p><h1 className="mt-3 text-3xl font-bold">Examination ended</h1><p className="mt-4">Reason: {violationMessage[terminated as ViolationType]}</p><p className="mt-2 text-sm text-slate-500">This session cannot be continued.</p></div></main>;

  const score=questions.filter(item=>session.answers[item.id]!==undefined&&session.answers[item.id]===item.correctAnswer).length;
  const remaining=started?Math.max(0,20000-(now-(session.questionStartedAt??now))):20000;
  const checksReady=Boolean(screen&&fullscreen&&face?.faceCount===1);
  const go=(index:number)=>persist({...session,questionIndex:index,questionStartedAt:Date.now()});

  const selectOption=(choice:number)=>{
    setSelectedOption(choice);
  };

  const submitCurrentAnswer=()=>{
    if(selectedOption===null||!session)return;
    const answers={...session.answers,[q.id]:selectedOption};
    const updatedScore=questions.filter(item=>answers[item.id]!==undefined&&answers[item.id]===item.correctAnswer).length;

    if(updatedScore>=PASSING_SCORE){
      ended.current=true;
      persist({...session,answers,status:'COMPLETED',result:'PASS'});
      finish();
      return;
    }

    if(session.questionIndex===questions.length-1){
      const passed=updatedScore>=PASSING_SCORE;
      ended.current=true;
      persist({...session,answers,status:'COMPLETED',result:passed?'PASS':'FAIL'});
      finish();
    }else{
      persist({...session,answers,questionIndex:session.questionIndex+1,questionStartedAt:Date.now(),sync:offline?'local':'syncing'});
      setSelectedOption(null);
    }
  };

  const skipCurrentQuestion=()=>{
    if(!session)return;
    setSelectedOption(null);
    if(session.questionIndex<questions.length-1){
      persist({...session,questionIndex:session.questionIndex+1,questionStartedAt:Date.now()});
    }
  };

  const submitTest=()=>{
    if(!session)return;
    let answers={...session.answers};
    if(selectedOption!==null){
      answers[q.id]=selectedOption;
    }
    const finalScore=questions.filter(item=>answers[item.id]!==undefined&&answers[item.id]===item.correctAnswer).length;
    const passed=finalScore>=PASSING_SCORE;
    ended.current=true;
    persist({...session,answers,status:'COMPLETED',result:passed?'PASS':'FAIL'});
    finish();
  };

  return <main className="mx-auto max-w-4xl px-4 py-6">
    {/* Proctoring engines remain mounted and active in background when started */}
    <div className={started ? "hidden" : "mb-6 space-y-4"}>
      <ScreenProctor onStarted={setScreen} onViolation={onScreenViolation}/>
      <ProctoredCamera sessionId={session.id} onMultipleFaces={recordMultiple} onMultipleFacesResolved={()=>undefined} onFaceMissing={(duration)=>setNotice(`Face not detected for ${(duration/1000).toFixed(1)} seconds.`)} onLookingAway={(duration)=>setNotice(`Please focus on the examination screen. Looking away for ${(duration/1000).toFixed(1)} seconds was detected.`)} onSnapshot={setFace} onDetectorError={()=>setNotice('Face monitoring could not be started.')} onAudioEvent={recordAudio}/>
      {!started&&<div className="card p-4 text-sm"><b>LIVE PROCTORING</b><p className="mt-3">Camera: ✓ Connected</p><p>Face: {face?.faceCount===1?'✓ Exactly 1 face':face?.faceCount===0?'⚠ FACE NOT DETECTED':`⚠ ${face?.faceCount??0} faces`}</p><p>FPS: {face?.fps.toFixed(1)??'—'}</p><p>Head: {face?.headDirection?.replaceAll('_',' ')??'Searching'}</p><p>Microphone: ✓ Monitoring</p><p>Screen: {screen?`✓ ${screen.display} · LOCKED`:'⚠ Entire screen required'}</p><p>Fullscreen: {fullscreen?'✓ Active':'⚠ Required'}</p><p>Browser: Waiting for secure start</p><p className="mt-3">{offline?'⚠ Answers saved locally':'✓ Answers synced'}</p><button onClick={()=>setOffline(!offline)} className="mt-3 text-left font-bold text-blue-800">Demo: {offline?'restore connection':'go offline'}</button></div>}
    </div>

    {/* Pre-Exam Setup View */}
    {!started&&<div className="card mb-6 p-6"><p className="font-bold text-blue-700">EXAM SECURITY CHECK</p><h1 className="mt-2 text-2xl font-bold">Complete every check to begin</h1><div className="mt-5 grid gap-2 text-sm sm:grid-cols-2"><p>{face?'✓':'…'} Camera</p><p>{face?'✓':'…'} Microphone</p><p>{screen?'✓':'⚠'} Screen sharing</p><p>{screen?.surface==='monitor'?'✓':'⚠'} Entire screen</p><p>{fullscreen?'✓':'⚠'} Fullscreen required</p><p>{face?.faceCount===1?'✓':'⚠'} Exactly 1 face</p></div><p className="mt-4 text-sm text-slate-600">Share your entire screen, wait for one face to be detected, then enter fullscreen to start.</p><button disabled={!screen||face?.faceCount!==1} onClick={enterFullscreenAndStart} className="btn-primary mt-5">Enter fullscreen &amp; start exam</button>{!checksReady&&<p className="mt-2 text-xs text-slate-500">The button becomes fully ready once screen sharing and exactly one detected face are available. Fullscreen is activated by this button.</p>}</div>}

    {/* Exam Header: Question count and Score on left, Countdown timer on right */}
    {started&&<div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4"><div><p className="text-xl font-bold text-slate-900">Question {session.questionIndex+1} / {questions.length}</p><p className="mt-1 text-sm font-semibold text-emerald-700">Total Score: {score} / {questions.length}</p></div><div className="rounded-xl bg-slate-900 px-5 py-3 font-mono text-xl font-bold text-white">00:{String(Math.ceil(remaining/1000)).padStart(2,'0')}</div></div>}

    {/* Notice Banner */}
    {notice&&<div role="alert" className="mb-6 rounded-xl border-2 border-amber-500 bg-amber-50 p-4"><b>⚠ Proctoring notice</b><p className="mt-1 text-sm">{notice}</p><button onClick={()=>setNotice('')} className="mt-2 text-sm font-bold text-blue-800">I understand</button></div>}

    {/* Active Exam Section */}
    {started?<section className={`card p-6 sm:p-8 ${notice?'pointer-events-none opacity-60':''}`}><div className="mb-6 h-2 overflow-hidden rounded bg-slate-100"><div className="h-full bg-blue-600" style={{width:`${((session.questionIndex+1)/questions.length)*100}%`}}/></div><p className="text-xs font-bold uppercase tracking-wider text-blue-700">{q.category}</p><h2 className="mt-2 text-2xl font-bold text-slate-900">{q.question}</h2><div className="mt-7 space-y-3">{q.options.map((option,index)=><button key={option} onClick={()=>selectOption(index)} className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left font-semibold ${selectedOption===index?'border-blue-600 bg-blue-50 text-blue-950':'border-slate-200 hover:bg-slate-50'}`}><span>{selectedOption===index?'●':'○'}</span>{option}</button>)}</div><div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><button disabled={!session.questionIndex} onClick={()=>go(session.questionIndex-1)} className="btn-secondary">Previous</button><button onClick={skipCurrentQuestion} className="rounded-xl border border-amber-300 bg-amber-50 px-5 py-2.5 font-semibold text-amber-900 hover:bg-amber-100">Skip Question</button></div>{session.questionIndex===questions.length-1?<button onClick={submitTest} className="btn-primary bg-emerald-700 hover:bg-emerald-800 px-8">Submit Test</button>:<button disabled={selectedOption===null} onClick={submitCurrentAnswer} className="btn-primary w-full sm:w-auto px-8">Submit Answer</button>}</div></section>:<section className="card grid min-h-80 place-items-center p-8 text-center"><div><p className="font-bold text-blue-700">EXAM LOCKED</p><h2 className="mt-2 text-2xl font-bold">Questions will appear after security verification</h2><p className="mt-3 max-w-md text-slate-600">Share your entire screen, keep exactly one face visible, then click Enter fullscreen &amp; start exam.</p></div></section>}
  </main>;
}
