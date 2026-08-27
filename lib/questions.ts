export type Question = { id:string; question:string; options:string[]; correctAnswer:number; explanation:string; category:string };
const rows: [string,string[],number,string,string][] = [
['What does a red traffic signal mean?',['Stop before the line','Proceed carefully','Speed up','Turn only'],0,'A red signal requires you to stop safely.','Signals'],
['A triangular sign with a red border usually gives a…',['service direction','warning','parking location','speed score'],1,'Triangles commonly warn of hazards ahead.','Signs'],
['Before changing lanes, you should…',['brake suddenly','signal and check mirrors','sound the horn continuously','look only ahead'],1,'Signal early and check mirrors and blind spots.','Safety'],
['At a zebra crossing, you must…',['give way to pedestrians','park your vehicle','overtake quickly','use high beam'],0,'Pedestrians crossing have priority.','Pedestrians'],
['What does a circular sign with a red border generally indicate?',['mandatory action','restriction or prohibition','tourist information','hospital'],1,'Red-bordered circular signs indicate restrictions.','Signs'],
['Keep a safe following distance mainly to…',['save fuel','allow time to react','make traffic faster','avoid signalling'],1,'Space gives you time to brake safely.','Safety'],
['When an emergency vehicle approaches with siren on, you should…',['block the lane','give way safely','race ahead','stop in the middle'],1,'Give it space to pass without creating danger.','Emergency'],
['Overtaking is unsafe near a…',['straight clear road','pedestrian crossing','empty parking bay','wide shoulder'],1,'Visibility and pedestrian safety are reduced near crossings.','Overtaking'],
['A broken white line between lanes means…',['lanes may be crossed when safe','never cross it','road is closed','stop immediately'],0,'You may change lanes after checking it is safe.','Lane discipline'],
['Using a mobile phone while driving is…',['safe at low speed','allowed at signals','distracting and unsafe','required for navigation'],2,'Keep your attention on driving.','Safety'],
['A “No Entry” sign means…',['do not enter this road','parking permitted','one-way travel ahead','school ahead'],0,'Do not enter from that direction.','Signs'],
['At night, dip your headlights when…',['approaching another vehicle','on an empty road','parking','washing the vehicle'],0,'Dipped beams prevent glare for others.','Safety'],
['You should use your horn…',['to warn of danger when necessary','near hospitals','to show anger','continuously in traffic'],0,'Use the horn sparingly as a safety warning.','Safety'],
['If your vehicle begins to skid, you should…',['panic brake','steer smoothly and slow down','accelerate hard','turn sharply'],1,'Smooth inputs help regain control.','Emergency'],
['Parking is prohibited…',['where it blocks a crossing','in a marked bay','on private property with permission','where signs allow it'],0,'Never obstruct crossings or traffic flow.','Parking'],
['The safest action at an amber signal is…',['stop if it is safe','accelerate through','reverse','change lanes'],0,'Amber means prepare to stop; do not rush through.','Signals'],
['Seat belts should be worn by…',['the driver only','front passengers only','all occupants where available','children only'],2,'Seat belts protect all occupants.','Safety'],
['At an uncontrolled junction, you should…',['rush through','slow down and give way as needed','keep eyes closed','park'],1,'Approach cautiously and observe other road users.','Right of way'],
['A speed limit sign shows…',['maximum permitted speed','recommended parking time','minimum age','fuel level'],0,'Do not exceed the posted speed.','Signs'],
['When rain reduces visibility, you should…',['increase speed','use suitable lights and slow down','tailgate','turn off wipers'],1,'Reduce speed and make yourself visible.','Safety']
];
export const questions: Question[] = rows.map(([question,options,correctAnswer,explanation,category],i)=>({id:`q${i+1}`,question,options,correctAnswer,explanation,category}));
