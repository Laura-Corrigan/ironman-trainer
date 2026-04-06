import { useState, useEffect, useCallback, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";

const A = {
  name:"Ash", age:29, weight:78, height:"5'11\" / 180cm",
  goal:"12:00-13:00", goalDesc:"Finish strong. Completion is the priority.",
  equipment:{ swim:"Olympic 50m pool, pull buoy, paddles", bikeIndoor:"Wahoo turbo + Swift → Strava", bikeOutdoor:"Trek road bike", gym:"Full gym access" },
  bike:{ ftp:172, ftpTarget:188, z1:[0,103], z2:[103,140], z3:[140,163], z4:[163,172], ss:[150,163], race:[125,137] },
  run:{ fiveK:"23:00", hm:"sub-2:00", imPace:"5:40-6:00" },
  swim:{ current:"2:00/100m", target:"1:52/100m", racePace:"1:52-1:58/100m" },
  proj:{ swim:{t:"1:12-1:18",p:"1:52-1:58/100m"}, t1:{t:"5:00"}, bike:{t:"5:45-6:15",p:"130-140W avg"}, t2:{t:"4:00"}, run:{t:"4:10-4:45",p:"5:40-6:00/km"}, total:"12:00-13:00" }
};

const RACE = new Date(2026,6,12);
const DC = {swim:"#4ECDC4",bike:"#E8B44A",run:"#E8637A",strength:"#B68AE8",brick:"#6DC8A8",rest:"#555"};
const DI = {swim:"🏊",bike:"🚴",run:"🏃",strength:"🏋️",brick:"🔗",rest:"😴"};

const T = {
  bg:"#110F18", card:"#1A1722", cardAlt:"#221F2D", border:"#2E2A3A",
  borderLight:"#262233", text:"#E8E6F0", textMid:"#938EA5", textDim:"#5A5566",
  accent:"#9B72E8", accentDim:"#9B72E830", success:"#6DC84E", successDim:"#6DC84E22",
  info:"#9B72E8", infoDim:"#9B72E822",
};

function genPlan() {
  const start = new Date(2026,3,6);
  const phases = [
    {name:"Build I",wks:[1,2,3],desc:"You're fit and bike-confident — straight into structured work. Turbo sessions midweek keep things time-efficient around work. Weekends are for longer outdoor rides and runs."},
    {name:"Absorb",wks:[4],desc:"Recovery week. Volume drops 40%. Bike test on the turbo to see how much stronger you've got. Easy sessions only."},
    {name:"Build II",wks:[5,6,7],desc:"Harder than Build I. Longer efforts on the turbo, swim sessions pushing past 3km, and your first bike-to-run sessions to practise transitions."},
    {name:"Absorb",wks:[8],desc:"Second recovery week. Another bike test on turbo. If power has gone up, we update all your targets."},
    {name:"Race-specific",wks:[9,10,11],desc:"Everything at race effort. Full Ironman distance swim, longest rides, and a half-distance test in Week 10 to see exactly where you are."},
    {name:"Absorb",wks:[12],desc:"Easy week before the taper. Volume is low. Trust the work you've banked."},
    {name:"Taper",wks:[13],desc:"Training volume halves. Short sharp efforts to stay fresh. Focus on packing, travel, and getting your head right."},
    {name:"Race week",wks:[14],desc:"Light sessions, course familiarisation, race day Sunday July 12."},
  ];

  const P = [
// ═══ WEEK 1 (9.5hrs) ═══
{week:1,phase:"Build I",hrs:9.5,days:[
{day:"Mon",disc:"rest",title:"Rest day",desc:"Full rest. Foam roll or stretch for 20 minutes if you fancy it.",duration:0,distance:null,equipment:null,structure:null,rpe:null},
{day:"Tue",disc:"swim",title:"Swim test + pace work",desc:"Finding out your current pace, then practising holding it.",duration:55,distance:2.2,equipment:"Pool",rpe:"6-7/10",
structure:[
  {block:"Warm-up",time:"10min",detail:"400m easy swimming — mix of front crawl and backstroke, take your time"},
  {block:"Test",time:"~7min",detail:"Swim 400m as fast as you can. Time it. This tells us your current pace per 100m — we'll use this number to set targets for the next 13 weeks"},
  {block:"Main set",time:"25min",detail:"6 x 100m at the pace your test gave you (probably around 2:00 per 100m). Take 15-20 seconds rest between each one. Focus on keeping your stroke long and relaxed"},
  {block:"Wind down",time:"8min",detail:"400m easy — 200m with pull buoy (legs relaxed, focus on upper body pull), 200m backstroke"}
],adjust:"If the test wipes you out, just do 4 x 100m instead of 6. The test itself is the important bit today."},
{day:"Wed",disc:"bike",title:"Turbo — steady hard intervals",desc:"Structured turbo session. Set the power target in Swift and let it control the resistance.",duration:75,distance:null,equipment:"Turbo + Swift",rpe:"7/10",
structure:[
  {block:"Warm-up",time:"15min",detail:"Easy spinning, gradually building effort. Cadence 85-95rpm"},
  {block:"Main set",time:"45min",detail:"3 x 12 minutes at 150-163W (steady hard — you can breathe but wouldn't want to chat). 3 minutes easy spinning between each. This is the key session for building bike power"},
  {block:"Wind down",time:"15min",detail:"Easy spinning. Stretch your hip flexors and hamstrings after"}
],adjust:"If 150W feels too hard, drop to 140W. If it feels comfortable, hold 160W. The goal is completing all 3 sets — better to finish slightly easier than blow up halfway."},
{day:"Thu",disc:"run",title:"Tempo run",desc:"A faster-than-easy run in the middle of the week. Building your aerobic engine.",duration:50,distance:9.5,equipment:"Road or park",rpe:"6-7/10",
structure:[
  {block:"Warm-up",time:"15min",detail:"Easy jogging at 5:30-6:10/km. Just get loose"},
  {block:"Main set",time:"25min",detail:"25 minutes at 5:05-5:25/km — this is comfortably hard. You could talk in short sentences but wouldn't want to. Don't speed up on hills, just hold the effort steady"},
  {block:"Wind down",time:"10min",detail:"Easy jog. At the end, do 4 x 20-second fast strides with a walk back between each"}
],adjust:"If your legs are heavy from yesterday's turbo, just run the whole thing easy. Consistency matters more than one hard session."},
{day:"Fri",disc:"swim",title:"Swim — building distance",desc:"Pushing past 2km for the first time in a structured session.",duration:55,distance:2.4,equipment:"Pool",rpe:"5-6/10",
structure:[
  {block:"Warm-up",time:"10min",detail:"300m easy, whatever stroke feels good"},
  {block:"Main set A",time:"22min",detail:"4 x 200m at a comfortable pace (around 2:05-2:20 per 100m). Take 20 seconds rest between each"},
  {block:"Main set B",time:"12min",detail:"8 x 50m — each set of 4 gets faster. So: moderate, a bit harder, hard, near-sprint. Then repeat. 15 seconds rest between each"},
  {block:"Wind down",time:"8min",detail:"300m with pull buoy and paddles — this builds arm strength and gets you used to a stronger catch. Keep it relaxed"}
],adjust:"If you're flagging on the 200s, drop to 3 x 200m and add extra 50s instead."},
{day:"Sat",disc:"bike",title:"Long ride — outdoor",desc:"Weekend long ride on the Trek. Building time in the saddle and practising eating/drinking on the bike.",duration:180,distance:80,equipment:"Trek road bike",rpe:"5-6/10",
structure:[
  {block:"First 40min",time:"40min",detail:"Easy — don't push, let your legs warm up naturally"},
  {block:"Main block",time:"100min",detail:"Steady riding at 103-140W. Every 30 minutes, do 8 minutes a bit harder at around 150W (noticeably more effort but sustainable). Stay seated on climbs, try to keep cadence above 80rpm"},
  {block:"Eating & drinking",time:"ongoing",detail:"Start eating at 30 minutes. Aim for 60-70g of carbs per hour (roughly 2 gels or equivalent). Drink every 15 minutes. This is practice for race day — whatever works today, use on July 12"},
  {block:"Final 40min",time:"40min",detail:"Easy riding home. Spin your legs out gently for the last 10 minutes"}
],adjust:"If the weather's awful, do 2.5 hours on the turbo with the same structure. Outdoor is better for bike handling but turbo works fine."},
{day:"Sun",disc:"run",title:"Long run — easy",desc:"Building your running endurance. This is about time on your feet, not how fast you go.",duration:90,distance:15,equipment:"Road or park",rpe:"5/10",
structure:[
  {block:"First hour",time:"60min",detail:"Easy pace at 5:30-6:10/km. You should be able to hold a full conversation. If you can't, slow down"},
  {block:"Second half",time:"25min",detail:"Same easy pace. Include 4 x 30 seconds at a faster pace (around 5:10/km) — just enough to open your legs up, not to tire you out"},
  {block:"Cool down",time:"5min",detail:"Walk for 5 minutes at the end. Stretch your calves and quads"},
  {block:"Fuelling",time:"ongoing",detail:"Have a gel at 45 minutes. Practice what you'll do on race day"}
],adjust:"If Saturday's ride left your legs tired, slow the whole thing down and just accumulate time. The long run is sacred — never skip it, but always respect how you feel."}
]},
// ═══ WEEK 2 (10hrs) ═══
{week:2,phase:"Build I",hrs:10,days:[
{day:"Mon",disc:"rest",title:"Rest day",desc:"Full rest. Check your Strava data from last week. Any aches? 20 minutes of yoga if you want.",duration:0,distance:null,equipment:null,structure:null,rpe:null},
{day:"Tue",disc:"swim",title:"Swim — holding pace",desc:"Longer reps at your target pace. The 300m efforts are the engine for improvement.",duration:60,distance:2.6,equipment:"Pool",rpe:"7/10",
structure:[
  {block:"Warm-up",time:"10min",detail:"400m easy mixing strokes"},
  {block:"Main set",time:"30min",detail:"3 x 300m at your target pace (2:00 per 100m). Take 30 seconds rest between each. The key is keeping the same pace across all three — don't go hard on the first and die on the third"},
  {block:"Speed",time:"10min",detail:"6 x 50m at a fast effort — about 90% of your max. 15 seconds rest between each"},
  {block:"Wind down",time:"8min",detail:"300m easy with pull buoy — relax your legs, focus on rotation and catch"}
],adjust:"If the pace slips on the third 300m, that's fine — just note it. Consistency across all three reps is the goal over the coming weeks."},
{day:"Wed",disc:"bike",title:"Turbo — over-under intervals",desc:"The most effective session for building bike fitness. Alternating between hard and moderate effort teaches your body to recover while still working.",duration:75,distance:null,equipment:"Turbo + Swift",rpe:"8/10",
structure:[
  {block:"Warm-up",time:"15min",detail:"Easy build from light to moderate. A couple of 30-second fast spins to wake the legs up"},
  {block:"Main set",time:"42min",detail:"Do this 3 times: 3 minutes at 180W (hard — above your threshold, breathing heavily) then immediately 3 minutes at 155W (moderate — still working but more manageable). No rest between the hard and moderate bits. Take 5 minutes very easy spinning between each set of 3"},
  {block:"Wind down",time:"18min",detail:"Very easy spinning. This session is tough — eat something with protein and carbs within 30 minutes of finishing"}
],adjust:"If 180W is too much, drop to 175W. Better to finish all 3 rounds at a slightly lower power than blow up halfway through round 2."},
{day:"Thu",disc:"run",title:"Interval run",desc:"Short, fast repetitions. Builds top-end running speed.",duration:55,distance:10,equipment:"Flat route with GPS",rpe:"7-8/10",
structure:[
  {block:"Warm-up",time:"15min",detail:"Easy jog. Some high knees and leg swings to loosen up"},
  {block:"Main set",time:"28min",detail:"6 x 800m at a fast pace (4:15-4:36/km). Jog slowly for about 2-2:30 between each one. Keep the pace consistent — don't sprint the first one and crawl the last"},
  {block:"Wind down",time:"12min",detail:"Easy jog, then walk for the last few minutes"}
],adjust:"If your legs are heavy from yesterday's turbo, drop to 5 reps or slow the recovery jog. Heavy legs are normal the day after over-unders."},
{day:"Fri",disc:"strength",title:"Gym — functional strength",desc:"Building cycling power and running stability. Keep it functional, not bodybuilder stuff.",duration:45,distance:null,equipment:"Gym",rpe:"6/10",
structure:[
  {block:"Lower body",time:"20min",detail:"Hex bar deadlift: 3 sets of 8 at a moderate weight. Bulgarian split squats: 3 sets of 10 each leg (bodyweight or light dumbbells). Single-leg calf raises: 3 sets of 12 each leg"},
  {block:"Upper body & core",time:"15min",detail:"Cable rows: 3 x 12. Press-ups: 3 x 10. Then a core circuit: 30 seconds of dead bugs, 30 seconds of pallof press each side, 30 seconds of side plank each side. Do the circuit 3 times"},
  {block:"Stretching",time:"10min",detail:"Hip flexor stretch 2 minutes each side, pigeon stretch 1 minute each side, some thoracic spine rotations"}
],adjust:"Keep the gym light when bike and run volume is high. This is extra credit — never sacrifice a key swim/bike/run session for the gym."},
{day:"Sat",disc:"bike",title:"Long ride",desc:"Longest ride so far. Building on what you did in Mallorca.",duration:210,distance:92,equipment:"Trek road bike",rpe:"5-6/10",
structure:[
  {block:"Build",time:"30min",detail:"Easy warm-up, settle into your rhythm"},
  {block:"Main block",time:"140min",detail:"Steady at 103-140W. Every 30 minutes or so, do 10 minutes at around 150W. That's 4 efforts total in this block. Try holding an aero position during these harder bits if the road is flat enough"},
  {block:"Eating & drinking",time:"ongoing",detail:"70g carbs per hour from 30 minutes in. 500-600ml of fluid per hour. This IS race practice — if it works today, use it on July 12"},
  {block:"Final hour",time:"40min",detail:"Easy riding home. Spin the legs out"}
],adjust:"Bad weather? Do 3 hours on the turbo with the same effort structure. Outdoor is preferred but turbo works."},
{day:"Sun",disc:"run",title:"Long run — with faster block",desc:"First long run with a pace change. Building the ability to run faster when already tired.",duration:100,distance:17,equipment:"Road or park",rpe:"5-6/10",
structure:[
  {block:"Easy first hour",time:"60min",detail:"5:30-6:10/km throughout. Don't chase pace, just settle in"},
  {block:"Faster block",time:"25min",detail:"Pick the pace up to 5:05-5:25/km for 25 minutes. This is noticeably harder but not flat-out. Steady and controlled"},
  {block:"Wind down",time:"15min",detail:"Easy jog, then walk. Have a gel at 40 minutes and 80 minutes"}
],adjust:"If Saturday's ride has left you knackered, skip the faster block and keep the whole thing easy. The distance matters more than the pace."}
]},
// ═══ WEEK 3 (10.5hrs) ═══
{week:3,phase:"Build I",hrs:10.5,days:[
{day:"Mon",disc:"rest",title:"Rest day",desc:"Rest. This is the biggest week of Build I. Get 8+ hours sleep and eat well.",duration:0,distance:null,equipment:null,structure:null,rpe:null},
{day:"Tue",disc:"swim",title:"Swim — longer pace reps",desc:"Longest reps at your target pace so far. Deliberately pushing past your comfort zone.",duration:65,distance:2.8,equipment:"Pool",rpe:"7/10",
structure:[
  {block:"Warm-up",time:"10min",detail:"400m easy mixed strokes"},
  {block:"Main set",time:"32min",detail:"2 x 500m at your target pace (2:00 per 100m). Take 2 minutes rest between. This is 10 lengths at pace — the furthest you've held this effort continuously. Focus on keeping your stroke smooth even when it gets hard"},
  {block:"Speed",time:"12min",detail:"4 x 100m getting faster each one — start moderate, finish fast. 15 seconds rest between each"},
  {block:"Wind down",time:"8min",detail:"200m easy swimming"}
],adjust:"If 500m is too far to hold pace, break each one into 250m + a brief pause + 250m. The total distance matters more than doing it non-stop right now."},
{day:"Wed",disc:"bike",title:"Turbo — threshold intervals",desc:"The hardest turbo session of this block. Sustained hard efforts.",duration:75,distance:null,equipment:"Turbo + Swift",rpe:"8/10",
structure:[
  {block:"Warm-up",time:"15min",detail:"Build from easy to moderate. A couple of 1-minute efforts at 90% of max to prime your legs"},
  {block:"Main set",time:"45min",detail:"2 x 18 minutes at 163-172W (hard — you'll be breathing heavily by minute 14, that's normal). 8 minutes of very easy spinning between them. Hold your cadence at 85-95rpm"},
  {block:"Wind down",time:"15min",detail:"Easy spin. Eat and drink something straight after — this one depletes your energy stores"}
],adjust:"If you can't hold 163W for the full 18 minutes, drop to 155W. It's better to complete both intervals at a slightly lower power than fail halfway through."},
{day:"Thu",disc:"run",title:"Run — getting faster as you go",desc:"Learning to speed up over the course of a run. This is the most important pacing skill for Ironman — you want to be getting faster, not slower.",duration:55,distance:10.5,equipment:"Flat route with GPS",rpe:"7/10",
structure:[
  {block:"Warm-up",time:"15min",detail:"Easy jog"},
  {block:"Main set",time:"30min",detail:"30 minutes continuous, split into three 10-minute blocks: first at 5:25/km, second at 5:15/km, third at 5:05/km. Each block a bit faster than the last. Use GPS to check your pace"},
  {block:"Wind down",time:"10min",detail:"Easy jog and walk"}
],adjust:"If the first block at 5:25 already feels hard, shift everything 10 seconds per km slower. The pattern — getting faster — matters more than the exact numbers."},
{day:"Fri",disc:"swim",title:"Swim — speed and sighting",desc:"Faster short reps plus practising looking ahead (you'll need this in open water on race day).",duration:55,distance:2.6,equipment:"Pool",rpe:"6/10",
structure:[
  {block:"Warm-up",time:"8min",detail:"300m easy"},
  {block:"Main set",time:"30min",detail:"12 x 75m at a firm effort (faster than your target pace but not sprinting). 15 seconds rest between each. Every third one, lift your head out of the water for 3 strokes to practise sighting — this is how you'll navigate in the open water"},
  {block:"Easy distance",time:"10min",detail:"500m continuous at an easy pace with pull buoy and paddles. The paddles make you feel the water better and build pulling power"},
  {block:"Wind down",time:"5min",detail:"200m easy"}
],adjust:"If 15 seconds rest isn't enough, take 20. These are meant to be hard but not flat-out."},
{day:"Sat",disc:"bike",title:"Long ride — biggest of this block",desc:"4 hours on the Trek. Your longest ride so far in the plan.",duration:240,distance:108,equipment:"Trek road bike",rpe:"6/10",
structure:[
  {block:"Build",time:"30min",detail:"Easy start, warm into the ride"},
  {block:"Main block",time:"160min",detail:"Steady riding with 3 x 12 minutes at 150-163W (harder effort) spread through hours 2 and 3. 5 minutes easy between each"},
  {block:"Eating & drinking",time:"ongoing",detail:"FULL race nutrition practice: 80g carbs per hour, 600-750ml fluid per hour. If your stomach handles this today, you're sorted for race day. If not, we need to adjust now — not on July 12"},
  {block:"Wind down",time:"50min",detail:"Easy riding home"}
],adjust:"If you're feeling great at 3.5 hours, extend to 4.5. If you're fading, cut it at 3.5. Listen to your body — this is the peak of a 3-week block."},
{day:"Sun",disc:"run",title:"Long run — Ironman pace block",desc:"Running on yesterday's bike legs. This is what Ironman actually feels like.",duration:110,distance:19,equipment:"Road or park",rpe:"5-6/10",
structure:[
  {block:"Easy start",time:"70min",detail:"5:30-6:10/km. Let the bike legs loosen up — the first 20 minutes might feel rough, that's completely normal"},
  {block:"Ironman pace",time:"30min",detail:"Pick up to 5:40-6:00/km. This is the pace you'll aim for on race day. Right now it feels easy — but after 6 hours on the bike it won't. Get used to what this pace feels like"},
  {block:"Wind down",time:"10min",detail:"Easy jog and walk. Gel at 45 and 85 minutes"}
],adjust:"If Saturday's ride destroyed you, keep the entire run easy and skip the faster block. The distance matters more."}
]},
// ═══ WEEK 4 — Recovery + Bike Test (6hrs) ═══
{week:4,phase:"Absorb",hrs:6,days:[
{day:"Mon",disc:"rest",title:"Rest day",desc:"Full rest. Recovery week — this is where your body actually gets fitter. Sleep is your best friend.",duration:0,distance:null,equipment:null,structure:null,rpe:null},
{day:"Tue",disc:"swim",title:"Easy swim",desc:"No structure, no clock. Just swim easy for 30 minutes.",duration:30,distance:1.5,equipment:"Pool",rpe:"3/10",
structure:[{block:"Easy swim",time:"30min",detail:"1500m at whatever pace feels comfortable. Mix up your strokes. Practice a few drills if you want. No pressure."}],adjust:null},
{day:"Wed",disc:"bike",title:"⏱ Bike power test",desc:"The first big test — finding out how much stronger you've got on the bike. Do this on the turbo so the numbers are consistent.",duration:55,distance:null,equipment:"Turbo + Swift",rpe:"10/10 for 20min",
structure:[
  {block:"Warm-up",time:"15min",detail:"10 minutes easy spinning, then 3 x 1 minute fast spin (high cadence, light resistance), then 2 minutes steady"},
  {block:"THE TEST",time:"20min",detail:"20 minutes, as hard as you can sustain. Go all-out but pace it — start at around 172W and try to build if you can. Your average power for these 20 minutes, multiplied by 0.95, is your new bike fitness number. Record it in Strava"},
  {block:"Wind down",time:"20min",detail:"Very easy spinning. This hurts. We're looking for 178W+ as your average (meaning your effective threshold would be ~169W). If you get higher, even better"}
],adjust:"If you feel terrible from 3 weeks of training, push this to Thursday. You want reasonably fresh legs for this."},
{day:"Thu",disc:"run",title:"Easy shakeout",desc:"Just get moving. Recovery pace.",duration:30,distance:5,equipment:"Easy route",rpe:"3/10",
structure:[{block:"Easy jog",time:"30min",detail:"As easy as you want. Walk if you need to. 4 x 20-second strides at the end to keep your legs sharp."}],adjust:null},
{day:"Fri",disc:"rest",title:"Active recovery",desc:"30-minute walk or yoga. Let the test fatigue clear. If your bike power went up, update your turbo targets.",duration:0,distance:null,equipment:null,structure:null,rpe:null},
{day:"Sat",disc:"bike",title:"Easy ride",desc:"No hard efforts. Just enjoy being on the bike.",duration:90,distance:38,equipment:"Trek road bike",rpe:"4/10",
structure:[{block:"Easy ride",time:"90min",detail:"Flat route, 103-140W. Practise your eating and drinking but keep the effort very low."}],adjust:"Turbo spin if weather is bad."},
{day:"Sun",disc:"run",title:"Easy long run",desc:"Moderate distance, easy effort.",duration:60,distance:10.5,equipment:"Road or park",rpe:"4/10",
structure:[{block:"Easy run",time:"60min",detail:"5:30-6:10/km throughout. In the second half, include 2 x 3 minutes at a slightly faster pace (5:05-5:25/km) to keep your legs ticking. Walk 5 minutes at the end."}],adjust:null}
]},
// ═══ WEEK 5 — Build II (10.5hrs) ═══
{week:5,phase:"Build II",hrs:10.5,days:[
{day:"Mon",disc:"rest",title:"Rest day",desc:"Rest. If your bike power went up in last week's test, your turbo targets should be updated — the harder efforts should be a bit higher now.",duration:0,distance:null,equipment:null,structure:null,rpe:null},
{day:"Tue",disc:"swim",title:"Swim — pace improvement",desc:"Same structure as Week 2 but with tighter rest. If you're fitter, the pace should feel more comfortable now.",duration:60,distance:2.8,equipment:"Pool",rpe:"7/10",
structure:[
  {block:"Warm-up",time:"10min",detail:"400m easy"},
  {block:"Main set",time:"32min",detail:"4 x 300m at your target pace (2:00 per 100m, or slightly faster if Week 1's test was quicker). 25 seconds rest between each. If the last two feel easier than in Week 2, you're improving"},
  {block:"Speed",time:"8min",detail:"4 x 50m fast. 15 seconds rest"},
  {block:"Wind down",time:"8min",detail:"200m easy"}
],adjust:null},
{day:"Wed",disc:"bike",title:"Turbo — longer steady efforts",desc:"Longer blocks at that steady-hard effort. Bigger stimulus than Week 1's 12-minute blocks.",duration:80,distance:null,equipment:"Turbo + Swift",rpe:"7/10",
structure:[
  {block:"Warm-up",time:"12min",detail:"Easy build"},
  {block:"Main set",time:"56min",detail:"2 x 22 minutes at 150-163W (use your updated numbers from last week's test if they changed). 6 minutes easy between. These are 10 minutes longer than Week 1 — that's the progression"},
  {block:"Wind down",time:"12min",detail:"Easy spin"}
],adjust:null},
{day:"Thu",disc:"brick",title:"Bike-to-run — first transition practice",desc:"Bike then immediately run. This is what the transition from bike to run feels like on race day — your legs will feel like concrete at first.",duration:100,distance:null,equipment:"Turbo then road",rpe:"6-7/10",
structure:[
  {block:"Bike",time:"70min",detail:"60 minutes at easy effort (103-140W) on the turbo, then 10 minutes harder at 150-163W to simulate finishing the bike leg"},
  {block:"Transition",time:"~3min",detail:"Off the turbo. Running shoes on. Out the door. Time yourself — on race day you want this under 4 minutes"},
  {block:"Run",time:"25min",detail:"Your legs will feel terrible for the first 10 minutes — that's completely normal. Just run at whatever pace feels manageable. After 10 minutes, settle into your Ironman race pace (5:40-6:00/km) for the final 15 minutes"}
],adjust:"The run feeling awful at first is the whole point of this session. It gets better with practice — this is Ironman-specific fitness you can't get any other way."},
{day:"Fri",disc:"swim",title:"Swim — breaking 3km",desc:"Your first 3km swim session. A mental milestone.",duration:65,distance:3.0,equipment:"Pool",rpe:"5-6/10",
structure:[
  {block:"Warm-up",time:"10min",detail:"500m easy"},
  {block:"Main set",time:"34min",detail:"1500m continuous at a comfortable pace (about 2:05-2:15 per 100m) — no stopping. Just keep swimming. Then 4 x 100m with paddles at a faster effort — the paddles build pulling strength. 15 seconds rest between each"},
  {block:"Wind down",time:"8min",detail:"300m easy. You've just done 3km for the first time in a structured session. Note how it felt"}
],adjust:null},
{day:"Sat",disc:"bike",title:"Long ride — race simulation",desc:"Longest ride of this block. Practising everything together: effort, position, eating.",duration:270,distance:122,equipment:"Trek road bike",rpe:"6/10",
structure:[
  {block:"Build",time:"30min",detail:"Easy warm-up"},
  {block:"Main block",time:"180min",detail:"Steady riding with 3 x 15 minutes at your race effort (125-137W, or updated from test). Full nutrition: 80g carbs per hour. Try to hold an aero position during the harder 15-minute blocks"},
  {block:"Wind down",time:"60min",detail:"Easy riding home"}
],adjust:"Bad weather? 4 hours on turbo with same structure."},
{day:"Sun",disc:"run",title:"Long run — half marathon distance",desc:"First 21km run in the plan. You've done this before — sub-2 hours fresh. Today is about pacing off tired legs.",duration:120,distance:21,equipment:"Road",rpe:"5-6/10",
structure:[
  {block:"Easy first half",time:"75min",detail:"5:30-6:10/km. Don't chase pace. Just settle in"},
  {block:"Ironman pace",time:"35min",detail:"Pick up to 5:40-6:00/km. Hold it steady. Walk briefly at 15km if you need to"},
  {block:"Wind down",time:"10min",detail:"Easy jog then walk. Gels at 40, 80, and 100 minutes"}
],adjust:"You're running half marathon distance off Saturday's big ride. If your legs aren't there, run 90 minutes easy instead. The distance will come."}
]},
// ═══ WEEK 6 (11hrs) ═══
{week:6,phase:"Build II",hrs:11,days:[
{day:"Mon",disc:"rest",title:"Rest day",desc:"Rest. Mid-build check: how's your sleep? Appetite? Mood? If all three are suffering, swap Thursday for an easy day.",duration:0,distance:null,equipment:null,structure:null,rpe:null},
{day:"Tue",disc:"swim",title:"Swim — race pace practice",desc:"Swimming faster than your current comfortable pace. Stretching toward your race-day target.",duration:65,distance:2.8,equipment:"Pool",rpe:"7/10",
structure:[
  {block:"Warm-up",time:"10min",detail:"400m easy"},
  {block:"Main set",time:"35min",detail:"3 x 400m at 1:55 per 100m — this is faster than your current comfortable pace, and that's the point. If 1:55 feels too fast, 1:58 is fine. 30 seconds rest between each. 200m easy between sets"},
  {block:"Wind down",time:"8min",detail:"200m easy"}
],adjust:"If you can't hold 1:58 for 400m, hold whatever pace you can and note it. We're tracking improvement, not perfection."},
{day:"Wed",disc:"bike",title:"Turbo — harder over-unders",desc:"Same concept as Week 2 but longer efforts. Alternating hard and moderate with no break between.",duration:85,distance:null,equipment:"Turbo + Swift",rpe:"8/10",
structure:[
  {block:"Warm-up",time:"15min",detail:"Easy build"},
  {block:"Main set",time:"52min",detail:"Do this twice: 3 rounds of (4 minutes hard at threshold + 4 minutes moderate at 150-163W) — no rest between hard and moderate, just switch power. 6 minutes easy between the two big sets"},
  {block:"Wind down",time:"18min",detail:"Easy spin. Refuel immediately"}
],adjust:null},
{day:"Thu",disc:"run",title:"Run — tempo + fast finish",desc:"Two gears in one session. Marathon effort plus some top-end speed.",duration:58,distance:11,equipment:"Road",rpe:"7/10",
structure:[
  {block:"Warm-up",time:"15min",detail:"Easy jog"},
  {block:"Tempo",time:"20min",detail:"20 minutes at 5:05-5:25/km — steady, comfortably hard"},
  {block:"Speed",time:"13min",detail:"5 x 400m at a fast pace (4:15-4:30/km) with a 200m slow jog between each. These are hard but short"},
  {block:"Wind down",time:"10min",detail:"Easy jog and walk"}
],adjust:null},
{day:"Fri",disc:"swim",title:"Swim — sighting practice",desc:"Practising lifting your head to look where you're going. Essential for the open water swim on race day.",duration:60,distance:2.8,equipment:"Pool",rpe:"6/10",
structure:[
  {block:"Warm-up",time:"8min",detail:"300m easy"},
  {block:"Main set",time:"38min",detail:"3 x 800m at a firm, comfortable pace (2:00-2:05 per 100m). 1 minute rest between each. Every 200m, lift your head for 3 strokes to look forward — this is called sighting, and it's how you navigate in open water. It costs a bit of speed, so practise until it feels automatic"},
  {block:"Wind down",time:"8min",detail:"200m easy"}
],adjust:null},
{day:"Sat",disc:"bike",title:"Long ride — biggest of Build II",desc:"5 hours on the Trek. This is the longest ride of this block. By hour 4 your legs will be heavy — that's the mental training.",duration:300,distance:138,equipment:"Trek road bike",rpe:"6/10",
structure:[
  {block:"Build",time:"30min",detail:"Easy start"},
  {block:"Main block",time:"210min",detail:"Steady effort with 4 x 12 minutes harder (150-163W) in hours 2-4. Full race nutrition: 80g carbs per hour. Routes with some hills are good if possible"},
  {block:"Wind down",time:"60min",detail:"Easy riding home"}
],adjust:"The heavy legs in hour 4 are the point — this is mental training as much as physical."},
{day:"Sun",disc:"run",title:"Long run — start slow, finish faster",desc:"Practising the race-day strategy: get faster as you go, not slower.",duration:130,distance:23,equipment:"Road",rpe:"6/10",
structure:[
  {block:"Easy start",time:"70min",detail:"Start at 5:50/km. Nice and comfortable"},
  {block:"Build",time:"40min",detail:"Gradually get faster: 5:40/km for a while, then 5:30/km, then 5:20/km. The idea is each 10-15 minutes you're a tiny bit quicker"},
  {block:"Wind down",time:"20min",detail:"Easy jog and walk. Walk through 2 'imaginary aid stations' at 10km and 18km for 20 seconds each — practise walking through like you will on race day. Gels every 30 minutes"}
],adjust:null}
]},
// ═══ WEEK 7 — Build II peak (11.5hrs) ═══
{week:7,phase:"Build II",hrs:11.5,days:[
{day:"Mon",disc:"rest",title:"Rest day",desc:"Rest. This is the biggest week of the entire plan. After this, everything gets easier.",duration:0,distance:null,equipment:null,structure:null,rpe:null},
{day:"Tue",disc:"swim",title:"Swim — pace check",desc:"5 x 300m at pace. If you can hold a faster pace than Week 2, your swim fitness has improved.",duration:70,distance:3.1,equipment:"Pool",rpe:"7/10",
structure:[
  {block:"Warm-up",time:"10min",detail:"400m easy"},
  {block:"Main set",time:"38min",detail:"5 x 300m at your target pace (aim for 1:58 per 100m or faster — compare to Weeks 2 and 5). 25 seconds rest between each. If you're holding 1:58 or better, you've taken 2 seconds off your pace in 6 weeks"},
  {block:"Speed",time:"8min",detail:"4 x 50m fast"},
  {block:"Wind down",time:"8min",detail:"200m easy"}
],adjust:null},
{day:"Wed",disc:"bike",title:"Turbo — hardest bike session",desc:"Sustained threshold intervals. If you can complete these, your bike fitness is probably higher than your last test showed.",duration:85,distance:null,equipment:"Turbo + Swift",rpe:"9/10",
structure:[
  {block:"Warm-up",time:"15min",detail:"Progressive build"},
  {block:"Main set",time:"55min",detail:"2 x 22 minutes at 163-172W (use updated targets). 10 minutes easy spinning between them. This is hard. By minute 18 you'll be really digging in — hold your form and keep pedalling"},
  {block:"Wind down",time:"15min",detail:"Easy spin"}
],adjust:"If you complete both 22-minute efforts at 163W+, your actual threshold is probably higher than what we tested at Week 4. We'll confirm with the Week 8 test."},
{day:"Thu",disc:"brick",title:"Bike-to-run — longer version",desc:"Same as Week 5 but longer. Building that transition fitness.",duration:120,distance:null,equipment:"Turbo then road",rpe:"7/10",
structure:[
  {block:"Bike",time:"85min",detail:"60 minutes easy, then 25 minutes at race effort (125-137W)"},
  {block:"Run",time:"30min",detail:"Straight off the bike. 10 minutes finding your legs, then 20 minutes at Ironman pace (5:40-6:00/km). Notice how your legs feel at minute 5 compared to minute 25 — they should improve"}
],adjust:null},
{day:"Fri",disc:"strength",title:"Gym — last session",desc:"Last gym session of the plan. After this, it's all swimming, cycling and running.",duration:35,distance:null,equipment:"Gym",rpe:"6/10",
structure:[
  {block:"Strength",time:"25min",detail:"Squats: 3 sets of 6 at a heavier weight than Week 2. Romanian deadlifts: 3 sets of 8. Cable rows: 3 sets of 10"},
  {block:"Core",time:"10min",detail:"Core circuit plus hip stretching"}
],adjust:null},
{day:"Sat",disc:"bike",title:"Long ride — longest of the plan",desc:"5.5 hours on the Trek. Your longest ride. If you get to 5 hours feeling in control, race day is within reach.",duration:330,distance:150,equipment:"Trek road bike",rpe:"6/10",
structure:[
  {block:"Build",time:"30min",detail:"Easy start"},
  {block:"Main block",time:"240min",detail:"Steady effort with 3 x 18 minutes at race effort (125-137W) in hours 2-4. Full race nutrition: 80g carbs/hr. This ride is about executing everything — nutrition, pacing, aero position, and mental strategies for when it gets hard at hour 4-5"},
  {block:"Wind down",time:"60min",detail:"Easy home"}
],adjust:"This ride proves you can handle the bike distance. The hardest part is mental after hour 4 — have a plan for when it gets tough."},
{day:"Sun",disc:"run",title:"Long run — marathon rehearsal",desc:"Longest run of the plan. Everything you'll use on July 12, use it today.",duration:140,distance:25,equipment:"Road",rpe:"6/10",
structure:[
  {block:"Easy",time:"80min",detail:"5:30-6:10/km"},
  {block:"Ironman pace",time:"45min",detail:"5:40-6:00/km. Race shoes, race belt, race nutrition. Full dress rehearsal"},
  {block:"Wind down",time:"15min",detail:"Easy jog and walk"}
],adjust:null}
]},
// ═══ WEEK 8 — Recovery + Bike Test 2 (6hrs) ═══
{week:8,phase:"Absorb",hrs:6,days:[
{day:"Mon",disc:"rest",title:"Rest day",desc:"Full rest. You've just finished the hardest training block. Book a massage if you can.",duration:0,distance:null,equipment:null,structure:null,rpe:null},
{day:"Tue",disc:"swim",title:"Easy swim",desc:"No structure. Just swim easy.",duration:30,distance:1.5,equipment:"Pool",rpe:"3/10",structure:[{block:"Easy",time:"30min",detail:"1500m easy, mixed strokes. No clock, no intervals. Just enjoy being in the water."}],adjust:null},
{day:"Wed",disc:"bike",title:"⏱ Bike power test 2",desc:"Same test as Week 4. How much has your bike fitness improved over 7 weeks of structured turbo work?",duration:55,distance:null,equipment:"Turbo + Swift",rpe:"10/10",
structure:[
  {block:"Warm-up",time:"15min",detail:"Same as Week 4: 10 minutes easy, 3 x 1 minute fast spins, 2 minutes steady"},
  {block:"THE TEST",time:"20min",detail:"20 minutes all-out. Same protocol. Compare your average power to Week 4. Target: 185W+ average. If you hit that, your race power becomes 140-148W — that's comfortably sub-6 hour bike territory"},
  {block:"Wind down",time:"20min",detail:"Easy spin"}
],adjust:null},
{day:"Thu",disc:"run",title:"Easy recovery",desc:"Gentle jog. Nothing more.",duration:30,distance:5,equipment:"Easy route",rpe:"3/10",structure:[{block:"Easy",time:"30min",detail:"As easy as you like. Walk breaks totally fine. 4 x 20-second strides at the end."}],adjust:null},
{day:"Fri",disc:"rest",title:"Active recovery",desc:"Walk or yoga. Review your test results. If your power went up, update your turbo targets for the next block.",duration:0,distance:null,equipment:null,structure:null,rpe:null},
{day:"Sat",disc:"bike",title:"Easy ride",desc:"Recovery spin.",duration:90,distance:38,equipment:"Trek road bike",rpe:"4/10",structure:[{block:"Easy",time:"90min",detail:"Flat route, easy effort. No hard efforts."}],adjust:null},
{day:"Sun",disc:"run",title:"Easy run",desc:"Moderate distance, comfortable pace.",duration:50,distance:9,equipment:"Road",rpe:"4/10",structure:[{block:"Easy",time:"50min",detail:"5:30-6:10/km with 2 x 3 minutes at a slightly faster pace in the second half."}],adjust:null}
]},
// ═══ WEEK 9 — Race-specific (12hrs) ═══
{week:9,phase:"Race-specific",hrs:12,days:[
{day:"Mon",disc:"rest",title:"Rest day",desc:"Rest. Everything from here is race-specific. Updated turbo targets should be loaded from the Week 8 test.",duration:0,distance:null,equipment:null,structure:null,rpe:null},
{day:"Tue",disc:"swim",title:"Full race distance swim",desc:"3.8km non-stop — the full Ironman swim distance. Your first time doing this in one go.",duration:85,distance:4.5,equipment:"Pool",rpe:"6-7/10",
structure:[
  {block:"Warm-up",time:"10min",detail:"500m easy"},
  {block:"Main",time:"62min",detail:"3800m continuous at your race pace (1:52-1:58 per 100m). That's 76 lengths. Don't sprint the first few hundred metres — settle into your rhythm by 400m and hold it. Every 500m, sight (lift your head) for a few strokes to practise"},
  {block:"Wind down",time:"8min",detail:"200m easy"}
],adjust:"If you need to stop briefly for water, that's fine — but try to keep it under 30 seconds. The goal is building confidence that you CAN swim 3.8km."},
{day:"Wed",disc:"bike",title:"Turbo — 3hrs at race effort",desc:"Dress rehearsal on the turbo. 3 hours at exactly the effort you'll hold on race day.",duration:180,distance:null,equipment:"Turbo + Swift",rpe:"6/10",
structure:[{block:"Race sim",time:"180min",detail:"3 hours at your race power (use updated numbers). Aero position throughout. Full race nutrition: 80-90g carbs per hour. This is a mini race rehearsal — everything should be dialled in"}],adjust:null},
{day:"Thu",disc:"run",title:"Run — sustained Ironman pace",desc:"45 minutes at race pace. Steady and controlled.",duration:70,distance:12.5,equipment:"Road",rpe:"6/10",
structure:[
  {block:"Warm-up",time:"15min",detail:"Easy jog"},
  {block:"Main",time:"45min",detail:"Continuous at 5:40-6:00/km. Walk for 20 seconds at the halfway point (simulating an aid station). Gel at 30 minutes"},
  {block:"Wind down",time:"10min",detail:"Easy jog"}
],adjust:null},
{day:"Fri",disc:"swim",title:"Swim — fast 100s",desc:"Keeping your speed sharp with shorter, faster reps.",duration:50,distance:2.2,equipment:"Pool",rpe:"7/10",
structure:[
  {block:"Warm-up",time:"8min",detail:"300m easy"},
  {block:"Main",time:"30min",detail:"10 x 100m at a fast effort (1:48-1:55 per 100m — harder than race pace). 15 seconds rest between each. Hold your technique even when tired"},
  {block:"Wind down",time:"8min",detail:"300m easy"}
],adjust:null},
{day:"Sat",disc:"bike",title:"Longest ride — 6 hours",desc:"Your biggest ride ever. This proves that 180km is within you.",duration:360,distance:168,equipment:"Trek road bike",rpe:"6/10",
structure:[{block:"Full ride",time:"360min",detail:"Steady effort with 4 x 18 minutes at race power spread through hours 2-5. Full race nutrition. Mentally rehearse everything — the flat sections, the hills, the headwind, the dark patch at hour 5 when you'll want to stop. You won't stop."}],adjust:null},
{day:"Sun",disc:"run",title:"Long run on tired legs",desc:"Running on yesterday's 6-hour ride legs. This is the closest thing to race day you'll experience in training.",duration:150,distance:26,equipment:"Road",rpe:"6-7/10",
structure:[
  {block:"Easy",time:"90min",detail:"5:30-6:10/km. Your legs will feel like concrete at first — completely normal. They loosen up around 20-30 minutes"},
  {block:"Ironman pace",time:"45min",detail:"5:40-6:00/km. This is the race-day simulation"},
  {block:"Wind down",time:"15min",detail:"Easy jog and walk"}
],adjust:null}
]},
// ═══ WEEK 10 — Half-Distance Test (9hrs) ═══
{week:10,phase:"Race-specific",hrs:9,days:[
{day:"Mon",disc:"rest",title:"Rest day",desc:"Rest. Saturday is the biggest test of the whole plan — a half-distance Ironman. It tells us exactly where you are.",duration:0,distance:null,equipment:null,structure:null,rpe:null},
{day:"Tue",disc:"swim",title:"Short sharp swim",desc:"Quick session to stay sharp without tiring yourself before Saturday.",duration:45,distance:2.0,equipment:"Pool",rpe:"6/10",
structure:[{block:"Session",time:"45min",detail:"400m warm-up. 4 x 200m at race pace with 20 seconds rest. 4 x 50m fast. 200m wind down."}],adjust:null},
{day:"Wed",disc:"bike",title:"Easy turbo opener",desc:"Legs out. Stay fresh for Saturday.",duration:60,distance:null,equipment:"Turbo + Swift",rpe:"4/10",
structure:[{block:"Opener",time:"60min",detail:"Easy spinning with 3 x 3 minutes at race power. Nothing more."}],adjust:null},
{day:"Thu",disc:"run",title:"Easy run opener",desc:"Stay loose.",duration:30,distance:5.5,equipment:"Easy route",rpe:"4/10",
structure:[{block:"Easy",time:"30min",detail:"Easy jog with 4 x 30 seconds at half marathon pace. That's it."}],adjust:null},
{day:"Fri",disc:"rest",title:"Rest before test",desc:"FULL REST. Eat plenty of carbs today (8-10g per kg of bodyweight = roughly 650-800g of carbs). Drink lots of water. Lay out all your kit for tomorrow. Visualise the day.",duration:0,distance:null,equipment:null,structure:null,rpe:null},
{day:"Sat",disc:"brick",title:"⏱ HALF-DISTANCE TEST",desc:"The most important training day of the plan. Half Ironman distance, full race effort. This tells you everything about July 12.",duration:330,distance:113,equipment:"Pool → Trek → Road",rpe:"9/10",
structure:[
  {block:"Swim 1.9km",time:"~36-40min",detail:"In the pool. Pace yourself — aim for 1:53-2:00 per 100m. Don't sprint the first 200m"},
  {block:"Transition 1",time:"~4min",detail:"Get changed. Helmet on. Time it"},
  {block:"Bike 90km",time:"~2:40-3:00",detail:"Trek road bike. Hold your race power (whatever your Week 8 test gave you). Full nutrition: 80g carbs per hour. Don't go harder than race power even if you feel good — save it for the run"},
  {block:"Transition 2",time:"~3min",detail:"Off the bike. Running shoes on. Go"},
  {block:"Run 21.1km",time:"~1:50-2:05",detail:"Ironman pace: 5:15-5:40/km (you're fresher than you'll be on race day, so this should be a touch faster). Walk the aid station equivalent at 5km and 15km"},
  {block:"Target",time:"Sub 5:45 total",detail:"Record EVERYTHING — times, average power, heart rate, pace, what you ate, how you felt at each stage. This data sets your race-day plan. If you go under 5:20, a sub-12 hour race is very realistic"}
],adjust:null},
{day:"Sun",disc:"rest",title:"Recovery",desc:"Full rest. Or a 20-minute easy jog if your legs want to move. Review all your data from yesterday.",duration:0,distance:null,equipment:null,structure:null,rpe:null}
]},
// ═══ WEEK 11 (10.5hrs) ═══
{week:11,phase:"Race-specific",hrs:10.5,days:[
{day:"Mon",disc:"rest",title:"Rest day",desc:"Rest. Review your half-distance test data. How did each leg feel? Does your race pacing need adjusting?",duration:0,distance:null,equipment:null,structure:null,rpe:null},
{day:"Tue",disc:"swim",title:"Confidence swim",desc:"After racing 1.9km last week, this should feel manageable.",duration:65,distance:3.0,equipment:"Pool",rpe:"6/10",
structure:[{block:"Session",time:"65min",detail:"400m warm-up. 2 x 1000m at a comfortable pace (2:00-2:05 per 100m) with 2 minutes rest between. 4 x 100m fast with 15 seconds rest. 200m wind down."}],adjust:null},
{day:"Wed",disc:"bike",title:"Turbo — race-effort blocks",desc:"Sustained efforts at your exact race power.",duration:150,distance:null,equipment:"Turbo or Trek",rpe:"6/10",
structure:[{block:"Session",time:"150min",detail:"30 minutes warm-up, then 3 x 22 minutes at race power with 10 minutes easy between each. Steady — no surges, no fading."}],adjust:null},
{day:"Thu",disc:"run",title:"Run — getting faster throughout",desc:"Practising your race strategy: start conservative, finish strong.",duration:60,distance:11.5,equipment:"Road",rpe:"6-7/10",
structure:[{block:"Session",time:"60min",detail:"15 minutes warm-up. Then 35 minutes getting progressively faster: 12 minutes at 5:40/km, 12 minutes at 5:25/km, 11 minutes at 5:10/km. 10 minutes easy wind down."}],adjust:null},
{day:"Fri",disc:"swim",title:"Light swim",desc:"Easy session to stay sharp.",duration:45,distance:2.0,equipment:"Pool",rpe:"5/10",
structure:[{block:"Session",time:"45min",detail:"300m warm-up. 8 x 75m at a firm effort with 15 seconds rest. 400m easy swimming. 200m wind down."}],adjust:null},
{day:"Sat",disc:"bike",title:"Last long ride",desc:"5 hours. Your final big ride. After today, the distance never comes back. Execute with precision.",duration:300,distance:140,equipment:"Trek road bike",rpe:"6/10",
structure:[{block:"Session",time:"300min",detail:"Steady effort with 3 x 18 minutes at race power in hours 2-4. Full race nutrition. This is your final bike dress rehearsal."}],adjust:null},
{day:"Sun",disc:"run",title:"Last long run",desc:"Final big run. Full dress rehearsal — race shoes, race belt, race nutrition. Everything exactly as July 12.",duration:135,distance:23.5,equipment:"Road",rpe:"6/10",
structure:[{block:"Session",time:"135min",detail:"80 minutes easy, 40 minutes at Ironman pace (5:40-6:00/km), 15 minutes easy wind down. The hay is in the barn after this one."}],adjust:null}
]},
// ═══ WEEK 12 — Recovery (5hrs) ═══
{week:12,phase:"Absorb",hrs:5,days:[
{day:"Mon",disc:"rest",title:"Rest",desc:"Rest. The big work is done. Trust the 11 weeks you've banked.",duration:0,distance:null,equipment:null,structure:null,rpe:null},
{day:"Tue",disc:"swim",title:"Easy swim",desc:"Easy. No pressure.",duration:30,distance:1.2,equipment:"Pool",rpe:"3/10",structure:[{block:"Easy",time:"30min",detail:"1200m at whatever pace feels good. Mix strokes."}],adjust:null},
{day:"Wed",disc:"bike",title:"Easy spin",desc:"No efforts.",duration:60,distance:25,equipment:"Turbo or Trek",rpe:"3/10",structure:[{block:"Easy",time:"60min",detail:"Flat and easy. 103-140W. Enjoy the ride."}],adjust:null},
{day:"Thu",disc:"run",title:"Easy run",desc:"Keep moving.",duration:30,distance:5.5,equipment:"Road",rpe:"3/10",structure:[{block:"Easy",time:"30min",detail:"Easy jog. 4 x 20-second strides at the end."}],adjust:null},
{day:"Fri",disc:"rest",title:"Stretching",desc:"30 minutes of yoga or stretching. Hip flexors, hamstrings, shoulders.",duration:30,distance:null,equipment:"Home or gym",rpe:"2/10",structure:[{block:"Mobility",time:"30min",detail:"Easy stretching. Focus on anything that feels tight."}],adjust:null},
{day:"Sat",disc:"bike",title:"Moderate ride",desc:"Quick reminder of race effort.",duration:75,distance:32,equipment:"Trek or turbo",rpe:"4/10",structure:[{block:"Ride",time:"75min",detail:"Easy effort with 2 x 5 minutes at race power. Just a reminder of what it feels like."}],adjust:null},
{day:"Sun",disc:"run",title:"Moderate run",desc:"Easy with a couple of faster bits.",duration:45,distance:8,equipment:"Road",rpe:"4/10",structure:[{block:"Run",time:"45min",detail:"Easy jog with 2 x 3 minutes at Ironman pace (5:40-6:00/km)."}],adjust:null}
]},
// ═══ WEEK 13 — Taper (4hrs) ═══
{week:13,phase:"Taper",hrs:4,days:[
{day:"Mon",disc:"rest",title:"Rest",desc:"Rest. You'll feel anxious about the reduced training — this is completely normal. Your fitness is banked. It doesn't disappear in a week. Start sorting travel, registration, gear bags.",duration:0,distance:null,equipment:null,structure:null,rpe:null},
{day:"Tue",disc:"swim",title:"Short swim opener",desc:"Quick and sharp.",duration:25,distance:1.2,equipment:"Pool",rpe:"5/10",structure:[{block:"Session",time:"25min",detail:"300m warm-up. 4 x 100m at race pace with 15 seconds rest. 200m wind down."}],adjust:null},
{day:"Wed",disc:"bike",title:"Short turbo opener",desc:"Quick legs.",duration:50,distance:null,equipment:"Turbo + Swift",rpe:"4/10",structure:[{block:"Session",time:"50min",detail:"Easy spinning with 3 x 3 minutes at race power. High cadence (95+rpm). Everything should feel easy — that's the taper working."}],adjust:null},
{day:"Thu",disc:"run",title:"Short run opener",desc:"Stay loose.",duration:25,distance:4.5,equipment:"Road",rpe:"4/10",structure:[{block:"Session",time:"25min",detail:"Easy jog with 3 x 2 minutes at Ironman pace. You'll feel like you need more. You don't."}],adjust:null},
{day:"Fri",disc:"swim",title:"Final swim",desc:"Last time in the pool.",duration:15,distance:0.6,equipment:"Pool",rpe:"3/10",structure:[{block:"Easy",time:"15min",detail:"600m easy. Visualise the swim start while you swim."}],adjust:null},
{day:"Sat",disc:"bike",title:"Bike opener + gear check",desc:"Final bike prep.",duration:40,distance:18,equipment:"Trek or turbo",rpe:"5/10",structure:[{block:"Session",time:"40min",detail:"Easy riding with 3 x 1 minute at threshold. Check bike is 100% race-ready: tyres, brakes, gears, bottle cages, bike computer."}],adjust:null},
{day:"Sun",disc:"run",title:"Final run opener",desc:"Carb loading starts today.",duration:20,distance:3.5,equipment:"Road",rpe:"4/10",structure:[{block:"Session",time:"20min",detail:"Easy jog with 3 x 30 seconds fast. Start carb loading today: 8-10g per kg of bodyweight in carbs for the next 3 days (~650-800g of carbs per day). Rice, pasta, bread, potatoes, sports drinks."}],adjust:null}
]},
// ═══ WEEK 14 — Race Week (2hrs) ═══
{week:14,phase:"Race week",hrs:2,days:[
{day:"Mon",disc:"rest",title:"Travel + register",desc:"Travel to the race venue. Register, collect your race pack. Walk around the swim start and T1 area. Eat well, drink plenty, stay off your feet.",duration:0,distance:null,equipment:null,structure:null,rpe:null},
{day:"Tue",disc:"swim",title:"Open water familiarisation",desc:"Quick swim at the race venue.",duration:15,distance:0.5,equipment:"Race venue",rpe:"3/10",structure:[{block:"Easy",time:"15min",detail:"Easy swim in the race water. Check the water temperature. Spot the buoys. Practise starting — treading water, then go. Calm and relaxed."}],adjust:null},
{day:"Wed",disc:"bike",title:"Course preview",desc:"Easy spin on the bike course.",duration:30,distance:14,equipment:"Trek",rpe:"3/10",structure:[{block:"Preview",time:"30min",detail:"Easy ride on the bike course. Note the turns, hills, aid stations, road surface. Make a mental map."}],adjust:null},
{day:"Thu",disc:"run",title:"Course jog",desc:"Last session before race day.",duration:15,distance:2.5,equipment:"Race venue",rpe:"3/10",structure:[{block:"Easy",time:"15min",detail:"Easy jog on the run course. Note landmarks. Visualise yourself running strong through the finish."}],adjust:null},
{day:"Fri",disc:"rest",title:"Pre-race rest",desc:"REST. Bike racked in transition. Gear bags checked. Race morning kit laid out. Gels taped to the top tube. Flat bottles ready. Early dinner — something you know works. Bed by 9pm.",duration:0,distance:null,equipment:null,structure:null,rpe:null},
{day:"Sat",disc:"rest",title:"Pre-race",desc:"10 minute jog only if you need to burn nervous energy. Otherwise full rest. Race briefing. High carb, low fibre dinner. Alarm set.",duration:10,distance:null,equipment:null,structure:null,rpe:null},
{day:"Sun",disc:"brick",title:"🏁 RACE DAY — IRONMAN",desc:"3.8km swim → 180km bike → 42.2km run",duration:720,distance:226,equipment:"Everything",rpe:"Everything you've got",
structure:[
  {block:"Swim 3.8km",time:"1:12-1:18",detail:"Easy start — don't sprint off the line. Find your rhythm by 400m. Sight every 8-10 strokes. Hold 1:52-1:58 per 100m. Don't fight for position, your race is against the clock not other people"},
  {block:"Transition 1",time:"5:00",detail:"Stay calm. Wetsuit off. Helmet on. Shoes on. Go. Don't rush — smooth is fast"},
  {block:"Bike 180km",time:"5:45-6:15",detail:"First 30km: hold 5 watts BELOW your race power — bank energy. Then hold race power (130-140W) for the next 130km. Final 20km: add 5 watts if you're feeling good. Eat 80-90g carbs per hour. Drink 600-750ml per hour. NEVER skip a feed, even if you don't feel hungry"},
  {block:"Transition 2",time:"4:00",detail:"Walk through T2. Put your shoes on. Belt on. Start jogging. Don't panic about the time"},
  {block:"Run 42.2km",time:"4:10-4:45",detail:"Walk the first aid station. Then settle into 5:40-6:00/km. Walk EVERY aid station for 15-20 seconds — this costs you about 3 minutes total but saves 15 minutes in the back half by keeping you fuelled and composed. From km 30, if your legs are still there, start pushing to 5:30/km. Coca-Cola at aid stations from km 25 — the sugar and caffeine hit is real"},
  {block:"FINISH",time:"12:00-13:00",detail:"YOU ARE AN IRONMAN."}
],adjust:null}
]}
  ];
  return P.map((w,i)=>{const ws=new Date(start);ws.setDate(ws.getDate()+i*7);const we=new Date(ws);we.setDate(we.getDate()+6);return{...w,startDate:ws,endDate:we,phaseDesc:(phases.find(p=>p.wks.includes(w.week))||{}).desc||""}});
}

const PLAN=genPlan();
const loadD=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch{return f}};
const saveD=(k,d)=>localStorage.setItem(k,JSON.stringify(d));
const getCW=()=>{const n=new Date();return Math.max(0,PLAN.findIndex(w=>n>=w.startDate&&n<=w.endDate))};
const fD=d=>d.toLocaleDateString("en-GB",{day:"numeric",month:"short"});
const dU=()=>Math.max(0,Math.ceil((RACE-new Date())/864e5));
const mH=m=>{if(!m)return"—";const h=Math.floor(m/60),mn=m%60;return h>0?`${h}h ${mn}m`:`${mn}m`};

const S={card:{background:T.card,borderRadius:12,border:`1px solid ${T.border}`,overflow:"hidden"},cardAlt:{background:T.cardAlt,borderRadius:10,padding:"8px 10px"},badge:c=>({fontSize:10,fontWeight:500,padding:"2px 8px",borderRadius:20,background:c+"22",color:c,border:`1px solid ${c}33`}),btn:{background:"none",border:`1px solid ${T.border}`,borderRadius:8,cursor:"pointer",fontFamily:"inherit",color:T.text}};

export default function App(){
  const[tab,setTab]=useState("plan");const[cw,setCw]=useState(getCW());const[comp,setComp]=useState(()=>loadD("im5-c",{}));const[met,setMet]=useState(()=>loadD("im5-m",{}));const[rpe,setRpe]=useState(()=>loadD("im5-r",{}));const[sel,setSel]=useState(null);const[modal,setModal]=useState(null);
  useEffect(()=>{saveD("im5-c",comp)},[comp]);useEffect(()=>{saveD("im5-m",met)},[met]);useEffect(()=>{saveD("im5-r",rpe)},[rpe]);
  const tog=useCallback((wi,di)=>{const k=`${wi}-${di}`;setComp(p=>{const n={...p};n[k]?delete n[k]:n[k]=Date.now();return n})},[]);
  const w=PLAN[cw];const tc=Object.keys(comp).length;const tw=PLAN.reduce((a,w)=>a+w.days.filter(d=>d.disc!=="rest").length,0);
  const ws=useMemo(()=>{if(!w)return{};const s={swim:0,bike:0,run:0,strength:0,brick:0,tMin:0,tDist:0,done:0,total:0};w.days.forEach((d,i)=>{if(d.disc==="rest")return;s.total++;s.tMin+=d.duration||0;s.tDist+=d.distance||0;if(d.disc in s)s[d.disc]+=d.duration||0;if(comp[`${cw}-${i}`])s.done++});return s},[w,cw,comp]);
  const pd=useMemo(()=>PLAN.map((w,i)=>{let sw=0,bk=0,rn=0,tm=0;w.days.forEach(d=>{tm+=d.duration||0;if(d.disc==="swim")sw+=d.distance||0;if(d.disc==="bike")bk+=d.distance||0;if(d.disc==="run")rn+=d.distance||0});const dn=w.days.filter((_,di)=>comp[`${i}-${di}`]).length;const tt=w.days.filter(d=>d.disc!=="rest").length;return{name:`W${w.week}`,week:w.week,phase:w.phase,hours:Math.round(tm/6)/10,swim:Math.round(sw*10)/10,bike:Math.round(bk),run:Math.round(rn*10)/10,compliance:tt>0?Math.round(dn/tt*100):0}}),[comp]);
  const db=useMemo(()=>w?[{n:"Swim",v:ws.swim,c:DC.swim},{n:"Bike",v:ws.bike,c:DC.bike},{n:"Run",v:ws.run,c:DC.run},{n:"Strength",v:ws.strength,c:DC.strength},{n:"Brick",v:ws.brick,c:DC.brick}].filter(d=>d.v>0):[],[w,ws]);
  const pc={"Build I":"#8B6AD8","Build II":"#B68AE8","Race-specific":"#6DC84E","Absorb":"#5A5566","Taper":"#C9A0FF","Race week":"#E85454"};
  const weekRPE=useMemo(()=>{const vals=w?.days.map((_,di)=>rpe[`${cw}-${di}`]).filter(Boolean).map(Number)||[];return vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length*10)/10:null},[w,cw,rpe]);

  return(<div style={{maxWidth:480,margin:"0 auto",fontFamily:"'DM Sans',sans-serif",color:T.text,minHeight:"100vh",background:T.bg}}>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;1,400&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet"/>
    <style>{`*{box-sizing:border-box}::-webkit-scrollbar{display:none}input,textarea,select{color:${T.text};background:${T.cardAlt};border:1px solid ${T.border};border-radius:8px;padding:7px 8px;font-family:inherit;font-size:13px;width:100%}button:active{opacity:0.8}`}</style>
    <div style={{padding:"1.25rem 1rem 0.75rem",textAlign:"center"}}>
      <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:3,textTransform:"uppercase",color:T.textDim}}>Ironman · July 12 · Finish strong</div>
      <div style={{fontSize:36,fontWeight:500,lineHeight:1.1,marginTop:4,color:T.accent}}>{dU()}<span style={{fontSize:14,fontWeight:400,color:T.textMid,marginLeft:6}}>days to go</span></div>
      <div style={{display:"flex",gap:5,justifyContent:"center",marginTop:8,flexWrap:"wrap"}}>
        <span style={S.badge(DC.bike)}>FTP {A.bike.ftp}→{A.bike.ftpTarget}W</span>
        <span style={S.badge(DC.swim)}>Pace 2:00→1:52</span>
        <span style={S.badge(T.success)}>{Math.round(tc/Math.max(tw,1)*100)}% complete</span>
      </div>
    </div>
    <div style={{display:"flex",borderBottom:`1px solid ${T.border}`,margin:"0 1rem"}}>
      {[["plan","Plan"],["dashboard","Dashboard"],["progress","Progress"],["profile","Zones"]].map(([k,l])=>(<button key={k} onClick={()=>setTab(k)} style={{flex:1,padding:"10px 0",fontSize:11,fontWeight:tab===k?500:400,color:tab===k?T.text:T.textDim,background:"none",border:"none",borderBottom:tab===k?`2px solid ${T.accent}`:"2px solid transparent",cursor:"pointer",fontFamily:"inherit"}}>{l}</button>))}
    </div>

    {tab==="plan"&&<div style={{padding:"1rem"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
        <button onClick={()=>{setCw(Math.max(0,cw-1));setSel(null)}} disabled={cw===0} style={{...S.btn,width:34,height:34,borderRadius:"50%",fontSize:14}}>←</button>
        <div style={{textAlign:"center"}}><div style={{fontSize:15,fontWeight:500}}>Week {w.week} <span style={{fontWeight:400,fontSize:12,color:T.textMid}}>of 14</span></div><div style={{fontSize:10,color:T.textDim}}>{fD(w.startDate)} – {fD(w.endDate)} · ~{w.hrs}hrs</div></div>
        <button onClick={()=>{setCw(Math.min(13,cw+1));setSel(null)}} disabled={cw===13} style={{...S.btn,width:34,height:34,borderRadius:"50%",fontSize:14}}>→</button>
      </div>
      <div style={{display:"flex",alignItems:"flex-start",gap:6,marginBottom:8}}>
        <span style={S.badge(pc[w.phase]||"#666")}>{w.phase}</span>
        <span style={{fontSize:11,color:T.textMid,lineHeight:1.5}}>{w.phaseDesc}</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:5,marginBottom:10}}>
        {[{l:"Time",v:mH(ws.tMin)},{l:"Dist",v:ws.tDist?`${Math.round(ws.tDist)}km`:"—"},{l:"Done",v:`${ws.done}/${ws.total}`},{l:"RPE",v:weekRPE?`${weekRPE}/10`:"—"}].map((s,i)=>(<div key={i} style={{...S.cardAlt,textAlign:"center"}}><div style={{fontSize:9,color:T.textDim,textTransform:"uppercase",letterSpacing:0.5}}>{s.l}</div><div style={{fontSize:14,fontWeight:500,marginTop:2}}>{s.v}</div></div>))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:5}}>
        {w.days.map((d,di)=>{const ic=!!comp[`${cw}-${di}`];const dm=met[`${cw}-${di}`];const ie=sel===`${cw}-${di}`;const ks=d.title.includes("⏱")||d.title.includes("🏁")||d.title.includes("HALF");
          return(<div key={di} style={{...S.card,border:ks?`1.5px solid ${DC[d.disc]||T.accent}`:ic?`1px solid ${T.success}33`:`1px solid ${T.border}`,opacity:d.disc==="rest"?0.55:1}}>
            <div onClick={()=>setSel(ie?null:`${cw}-${di}`)} style={{padding:"10px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:(DC[d.disc]||"#666")+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{DI[d.disc]}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:9,fontWeight:500,color:DC[d.disc]||T.textMid,textTransform:"uppercase",letterSpacing:0.5}}>{d.day}</span><span style={{fontSize:12,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.title}</span></div>
                <div style={{fontSize:10,color:T.textDim,marginTop:1}}>{d.disc!=="rest"?<>{mH(d.duration)}{d.distance?` · ${d.distance}km`:""}{d.equipment?` · ${d.equipment}`:""}</>:"Recovery"}</div>
              </div>
              {d.disc!=="rest"&&<button onClick={e=>{e.stopPropagation();tog(cw,di)}} style={{width:24,height:24,borderRadius:"50%",border:`2px solid ${ic?T.success:T.border}`,background:ic?T.success:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:ic?"#fff":"transparent",fontSize:12,flexShrink:0}}>{ic?"✓":""}</button>}
            </div>
            {ie&&<div style={{padding:"0 12px 12px",borderTop:`1px solid ${T.borderLight}`}}>
              {d.structure&&<div style={{marginTop:8}}>{d.structure.map((b,bi)=>(<div key={bi} style={{marginBottom:8}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}><span style={{fontSize:10,fontWeight:500,color:DC[d.disc]||T.accent,textTransform:"uppercase"}}>{b.block}</span><span style={{fontSize:10,color:T.textDim}}>{b.time}</span></div><div style={{fontSize:12,lineHeight:1.65,color:T.textMid}}>{b.detail}</div></div>))}</div>}
              {d.rpe&&<div style={{fontSize:11,color:T.textDim,marginTop:4,marginBottom:6}}>Target effort: <span style={{color:T.accent,fontWeight:500}}>{d.rpe}</span></div>}
              {d.adjust&&<div style={{background:T.cardAlt,borderRadius:8,padding:"8px 10px",marginBottom:8,fontSize:11,lineHeight:1.6,color:T.textMid}}><span style={{color:T.accent,fontWeight:500}}>If in doubt: </span>{d.adjust}</div>}
              {d.disc!=="rest"&&<div style={{display:"flex",gap:5,marginTop:6}}>
                <button onClick={()=>setModal({wi:cw,di,day:d})} style={{...S.btn,flex:1,padding:"7px 0",fontSize:11,fontWeight:500}}>{dm?"Edit metrics":"Log metrics"}</button>
                <select value={rpe[`${cw}-${di}`]||""} onChange={e=>setRpe(p=>({...p,[`${cw}-${di}`]:e.target.value}))} style={{width:90,fontSize:11,padding:"7px",textAlign:"center"}}><option value="">Effort...</option>{[1,2,3,4,5,6,7,8,9,10].map(n=><option key={n} value={n}>{n}/10</option>)}</select>
                <button onClick={()=>tog(cw,di)} style={{flex:1,padding:"7px 0",fontSize:11,fontWeight:500,border:"none",borderRadius:8,background:ic?T.successDim:T.infoDim,cursor:"pointer",color:ic?T.success:T.info,fontFamily:"inherit"}}>{ic?"Undo":"Done"}</button>
              </div>}
              {dm&&<div style={{marginTop:6,...S.cardAlt,fontSize:11,color:T.textMid,display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2px 10px"}}>{dm.dur&&<div>Duration: {dm.dur}min</div>}{dm.dist&&<div>Distance: {dm.dist}km</div>}{dm.hr&&<div>HR: {dm.hr}bpm</div>}{dm.power&&<div>Power: {dm.power}W</div>}{dm.pace&&<div>Pace: {dm.pace}/km</div>}{dm.notes&&<div style={{gridColumn:"1/-1",fontStyle:"italic"}}>"{dm.notes}"</div>}</div>}
            </div>}
          </div>)})}
      </div>
      <div style={{display:"flex",gap:2,marginTop:12,justifyContent:"center"}}>{PLAN.map((pw,i)=><button key={i} onClick={()=>{setCw(i);setSel(null)}} style={{width:i===cw?20:14,height:5,borderRadius:3,border:"none",cursor:"pointer",background:i===cw?(pc[pw.phase]||"#666"):i<=getCW()?T.textDim:T.border}}/>)}</div>
    </div>}

    {tab==="dashboard"&&<div style={{padding:"1rem"}}>
      <div style={{fontSize:14,fontWeight:500,marginBottom:8}}>Week {w.week} snapshot</div>
      <div style={{...S.card,padding:12,marginBottom:8}}>
        <div style={{fontSize:10,fontWeight:500,color:T.textMid,marginBottom:6}}>Time by discipline</div>
        <div style={{display:"flex",alignItems:"center"}}><div style={{width:100,height:100,flexShrink:0}}><ResponsiveContainer><PieChart><Pie data={db} cx="50%" cy="50%" innerRadius={26} outerRadius={44} dataKey="v" stroke="none">{db.map((d,i)=><Cell key={i} fill={d.c}/>)}</Pie></PieChart></ResponsiveContainer></div><div style={{flex:1,display:"flex",flexDirection:"column",gap:3,paddingLeft:10}}>{db.map((d,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:5,fontSize:11}}><span style={{width:7,height:7,borderRadius:2,background:d.c}}/><span style={{color:T.textMid}}>{d.n}</span><span style={{marginLeft:"auto",fontWeight:500}}>{mH(d.v)}</span></div>)}</div></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,marginBottom:8}}>
        {[{l:"Swim",v:`${Math.round(w.days.filter(d=>d.disc==="swim").reduce((a,d)=>a+(d.distance||0),0)*10)/10}km`,c:DC.swim},{l:"Bike",v:`${Math.round(w.days.filter(d=>d.disc==="bike"||d.disc==="brick").reduce((a,d)=>a+(d.distance||0),0))}km`,c:DC.bike},{l:"Run",v:`${Math.round(w.days.filter(d=>d.disc==="run").reduce((a,d)=>a+(d.distance||0),0)*10)/10}km`,c:DC.run}].map((s,i)=>(<div key={i} style={{background:s.c+"15",borderRadius:10,padding:8,textAlign:"center",border:`1px solid ${s.c}25`}}><div style={{fontSize:9,color:s.c,fontWeight:500,textTransform:"uppercase"}}>{s.l}</div><div style={{fontSize:17,fontWeight:500,marginTop:1}}>{s.v}</div></div>))}
      </div>
      <div style={{...S.card,padding:12,marginBottom:8}}><div style={{fontSize:10,fontWeight:500,color:T.textMid,marginBottom:4}}>Coach notes</div><p style={{fontSize:12,lineHeight:1.65,margin:0}}>{w.phaseDesc}</p></div>
      <div style={{...S.card,padding:12,marginBottom:8}}>
        <div style={{fontSize:10,fontWeight:500,color:T.textMid,marginBottom:6}}>Key benchmarks</div>
        {[{wk:1,l:"Swim speed test (400m timed)"},{wk:4,l:"Bike power test 1 — target 178W+"},{wk:8,l:"Bike power test 2 — target 185W+"},{wk:10,l:"Half-distance test — under 5:45"},{wk:14,l:"🏁 Race day — 12:00-13:00"}].map((b,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0",fontSize:12,borderBottom:i<4?`1px solid ${T.borderLight}`:"none"}}><span style={{width:18,height:18,borderRadius:"50%",border:`1.5px solid ${cw>=b.wk-1?T.success:T.border}`,background:cw>=b.wk-1?T.successDim:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:T.success,flexShrink:0}}>{cw>=b.wk-1?"✓":""}</span><span style={{color:T.textDim,fontSize:11}}>W{b.wk}</span><span>{b.l}</span></div>))}
      </div>
      <div style={{...S.card,padding:12}}>
        <div style={{fontSize:10,fontWeight:500,color:T.textMid,marginBottom:6}}>Equipment</div>
        {Object.entries(A.equipment).map(([k,v],i)=><div key={i} style={{fontSize:12,color:T.textMid,padding:"3px 0"}}><span style={{color:T.text,fontWeight:500}}>{k==="bikeIndoor"?"Turbo":k==="bikeOutdoor"?"Road bike":k.charAt(0).toUpperCase()+k.slice(1)}:</span> {v}</div>)}
      </div>
    </div>}

    {tab==="progress"&&<div style={{padding:"1rem"}}>
      <div style={{...S.card,padding:12,marginBottom:8}}>
        <div style={{fontSize:10,fontWeight:500,color:T.textMid,marginBottom:4}}>Weekly volume (hours)</div>
        <div style={{height:150}}><ResponsiveContainer><BarChart data={pd} barSize={16}><XAxis dataKey="name" tick={{fontSize:9,fill:T.textDim}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:9,fill:T.textDim}} axisLine={false} tickLine={false} width={22}/><Tooltip contentStyle={{fontSize:11,borderRadius:8,background:T.card,border:`1px solid ${T.border}`,color:T.text}} formatter={v=>[`${v}hrs`]}/><Bar dataKey="hours" radius={[3,3,0,0]}>{pd.map((d,i)=><Cell key={i} fill={i===cw?T.accent:i<=getCW()?"#9B72E8":"#9B72E833"}/>)}</Bar></BarChart></ResponsiveContainer></div>
      </div>
      <div style={{...S.card,padding:12,marginBottom:8}}>
        <div style={{fontSize:10,fontWeight:500,color:T.textMid,marginBottom:2}}>Distance by discipline</div>
        <div style={{display:"flex",gap:10,marginBottom:4,fontSize:10}}>{[{n:"Bike",c:DC.bike},{n:"Run",c:DC.run},{n:"Swim",c:DC.swim}].map((d,i)=><span key={i} style={{display:"flex",alignItems:"center",gap:3}}><span style={{width:7,height:7,borderRadius:2,background:d.c}}/><span style={{color:T.textMid}}>{d.n}</span></span>)}</div>
        <div style={{height:150}}><ResponsiveContainer><AreaChart data={pd}><XAxis dataKey="name" tick={{fontSize:9,fill:T.textDim}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:9,fill:T.textDim}} axisLine={false} tickLine={false} width={22}/><Tooltip contentStyle={{fontSize:11,borderRadius:8,background:T.card,border:`1px solid ${T.border}`,color:T.text}}/><Area type="monotone" dataKey="bike" stackId="1" fill={DC.bike+"33"} stroke={DC.bike} strokeWidth={1.5}/><Area type="monotone" dataKey="run" stackId="1" fill={DC.run+"33"} stroke={DC.run} strokeWidth={1.5}/><Area type="monotone" dataKey="swim" stackId="1" fill={DC.swim+"33"} stroke={DC.swim} strokeWidth={1.5}/></AreaChart></ResponsiveContainer></div>
      </div>
      <div style={{...S.card,padding:12,marginBottom:8}}>
        <div style={{fontSize:10,fontWeight:500,color:T.textMid,marginBottom:6}}>Compliance</div>
        {pd.map((pw,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:5,fontSize:10,marginBottom:3}}><span style={{width:22,fontFamily:"'Space Mono',monospace",fontSize:9,color:T.textDim}}>W{pw.week}</span><div style={{flex:1,height:5,background:T.cardAlt,borderRadius:3,overflow:"hidden"}}><div style={{width:`${pw.compliance}%`,height:"100%",background:pw.compliance===100?T.success:pw.compliance>0?"#9B72E8":"transparent",borderRadius:3}}/></div><span style={{width:26,textAlign:"right",fontWeight:500,color:pw.compliance===100?T.success:T.textMid,fontSize:9}}>{pw.compliance}%</span></div>)}
      </div>
      <div style={{...S.card,padding:12}}>
        <div style={{fontSize:10,fontWeight:500,color:T.textMid,marginBottom:6}}>Race day targets</div>
        {[{l:"Swim 3.8km",t:A.proj.swim.t,p:A.proj.swim.p},{l:"T1",t:A.proj.t1.t},{l:"Bike 180km",t:A.proj.bike.t,p:A.proj.bike.p},{l:"T2",t:A.proj.t2.t},{l:"Run 42.2km",t:A.proj.run.t,p:A.proj.run.p}].map((r,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:i<4?`1px solid ${T.borderLight}`:"none",fontSize:12}}><span style={{fontWeight:500}}>{r.l}</span><span style={{color:T.textMid,textAlign:"right"}}>{r.t}{r.p&&<span style={{fontSize:10,color:T.textDim,display:"block"}}>{r.p}</span>}</span></div>))}
        <div style={{display:"flex",justifyContent:"space-between",marginTop:8,paddingTop:8,borderTop:`1.5px solid ${T.border}`,fontSize:14,fontWeight:500}}><span>Target</span><span style={{color:T.accent}}>{A.proj.total}</span></div>
      </div>
    </div>}

    {tab==="profile"&&<div style={{padding:"1rem"}}>
      <div style={{...S.card,padding:12,marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><div style={{width:42,height:42,borderRadius:"50%",background:T.accent+"22",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:500,fontSize:15,color:T.accent}}>A</div><div><div style={{fontSize:15,fontWeight:500}}>{A.name}</div><div style={{fontSize:11,color:T.textMid}}>{A.age} · {A.weight}kg · {A.height}</div></div></div>
        <div style={{fontSize:12,lineHeight:1.6,color:T.textMid}}>Trained for Ironman Nov 2025 (didn't finish — bike accident). Been training since Jan 2026. Confident on bike after Mallorca. Uses Wahoo turbo with Swift feeding into Strava, Trek road bike outdoors, 50m pool, full gym.</div>
      </div>
      {[
        {icon:DI.bike,label:"Bike targets",badge:`FTP ${A.bike.ftp}W`,color:DC.bike,zones:[{z:"Easy effort",r:`<${A.bike.z1[1]}W`},{z:"Steady endurance",r:`${A.bike.z2[0]}-${A.bike.z2[1]}W`},{z:"Moderate-hard (tempo)",r:`${A.bike.z3[0]}-${A.bike.z3[1]}W`},{z:"Steady-hard (sweet spot)",r:`${A.bike.ss[0]}-${A.bike.ss[1]}W`,h:1},{z:"Hard (threshold)",r:`${A.bike.z4[0]}-${A.bike.z4[1]}W`},{z:"Race day power",r:`${A.bike.race[0]}-${A.bike.race[1]}W`,h:1}],notes:`Current threshold: ${A.bike.ftp}W. Target by race day: ${A.bike.ftpTarget}W. The bike is the biggest area for improvement — structured turbo sessions are the key.`},
        {icon:DI.run,label:"Run targets",badge:`5K: ${A.run.fiveK}`,color:DC.run,zones:[{z:"Recovery jog",r:">6:10/km"},{z:"Easy running",r:"5:30-6:10/km"},{z:"Comfortably hard",r:"5:05-5:25/km"},{z:"Hard (threshold)",r:"4:36-5:05/km"},{z:"Fast intervals",r:"<4:36/km"},{z:"Ironman race pace",r:A.run.imPace+"/km",h:1}],notes:`Strongest discipline. Half marathon under 2 hours. Ironman marathon target: 4:10-4:45 (accounting for 6 hours on the bike beforehand).`},
        {icon:DI.swim,label:"Swim targets",badge:`Pace: ${A.swim.current}`,color:DC.swim,zones:[{z:"Easy swimming",r:">2:20/100m"},{z:"Steady",r:"2:05-2:20/100m"},{z:"Firm effort",r:"1:55-2:05/100m"},{z:"Hard",r:"1:48-1:55/100m"},{z:"Race day pace",r:A.swim.racePace,h:1}],notes:`Current pace: ${A.swim.current}. Target by race day: ${A.swim.target}. Needs 8 seconds per 100m improvement — very achievable with consistent training.`},
      ].map((sec,si)=>(<div key={si} style={{...S.card,border:`1px solid ${sec.color}33`,padding:12,marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}><span style={{fontSize:15}}>{sec.icon}</span><span style={{fontSize:13,fontWeight:500}}>{sec.label}</span><span style={{...S.badge(sec.color),marginLeft:"auto"}}>{sec.badge}</span></div>
        {sec.zones.map((z,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",fontSize:12,fontWeight:z.h?500:400,color:z.h?sec.color:T.textMid}}><span>{z.z}</span><span>{z.r}</span></div>)}
        <div style={{fontSize:11,color:T.textDim,marginTop:6,lineHeight:1.5}}>{sec.notes}</div>
      </div>))}
    </div>}

    {modal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:100}} onClick={()=>setModal(null)}><div onClick={e=>e.stopPropagation()} style={{background:T.card,borderRadius:"16px 16px 0 0",width:"100%",maxWidth:480,padding:18,maxHeight:"80vh",overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}><div><div style={{fontSize:14,fontWeight:500}}>{modal.day.title}</div><div style={{fontSize:11,color:T.textMid}}>Log your workout</div></div><button onClick={()=>setModal(null)} style={{...S.btn,width:28,height:28,borderRadius:"50%",fontSize:14}}>✕</button></div>
      <MetricForm existing={met[`${modal.wi}-${modal.di}`]} onSave={data=>{setMet(p=>({...p,[`${modal.wi}-${modal.di}`]:data}));setModal(null)}}/>
    </div></div>}
  </div>);
}

function MetricForm({existing,onSave}){
  const[f,sF]=useState(existing||{});
  return(<><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
    {[{k:"dur",l:"Duration (min)"},{k:"dist",l:"Distance (km)"},{k:"hr",l:"Avg heart rate"},{k:"power",l:"Avg power (W)"},{k:"pace",l:"Avg pace (/km)"},{k:"cal",l:"Calories"}].map(x=>(<div key={x.k}><label style={{fontSize:10,color:T.textMid,display:"block",marginBottom:3}}>{x.l}</label><input value={f[x.k]||""} onChange={e=>sF(p=>({...p,[x.k]:e.target.value}))}/></div>))}
  </div>
  <div style={{marginTop:8}}><label style={{fontSize:10,color:T.textMid,display:"block",marginBottom:3}}>How did it feel?</label><textarea value={f.notes||""} onChange={e=>sF(p=>({...p,notes:e.target.value}))} rows={2}/></div>
  <button onClick={()=>onSave(f)} style={{width:"100%",marginTop:12,padding:11,fontSize:13,fontWeight:500,border:"none",borderRadius:8,background:T.accent,color:"#fff",cursor:"pointer",fontFamily:"inherit"}}>Save</button></>);
}
