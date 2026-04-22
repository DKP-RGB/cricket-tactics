// Static match data — embedded directly (no backend needed)
const matchData = {
    match_id: "ipl_2024_01",
    tournament: "IPL 2024",
    status: "LIVE",
    teams: {
        home: {
            name: "Chennai Super Kings",
            short_name: "CSK",
            score: "176/4",
            overs: "18.4",
        },
        away: {
            name: "Royal Challengers Bengaluru",
            short_name: "RCB",
            score: "173/6",
            overs: "20.0",
        },
    },
    current_state: {
        over: 18.4,
        batter: "Ravindra Jadeja",
        non_striker: "Shivam Dube",
        bowler: "Mohammed Siraj",
        last_ball: "Boundary (4)",
        win_probability: { CSK: 98, RCB: 2 },
    },
    graph: {
        nodes: [
            { id: "Jadeja", label: "Ravindra Jadeja", type: "Player", team: "CSK", val: 20 },
            { id: "Dube", label: "Shivam Dube", type: "Player", team: "CSK", val: 15 },
            { id: "Siraj", label: "Mohammed Siraj", type: "Player", team: "RCB", val: 18 },
            { id: "Pitch", label: "Chepauk Surface", type: "Pitch", val: 25 },
            { id: "DeepMidWicket", label: "Deep Mid-Wicket", type: "Position", val: 10 },
            { id: "ShortBall", label: "Short Ball Tactic", type: "Strategy", val: 12 },
        ],
        links: [
            { source: "Siraj", target: "Jadeja", type: "BOWLING_TO", strength: 5 },
            { source: "Jadeja", target: "Pitch", type: "BATTING_ON", strength: 3 },
            { source: "Siraj", target: "ShortBall", type: "EXECUTING", strength: 4 },
            { source: "ShortBall", target: "DeepMidWicket", type: "TARGETING", strength: 2 },
            { source: "Jadeja", target: "DeepMidWicket", type: "STRENGTH_AREA", strength: 5 },
        ],
    },
    tactical_insights: [
        "Jadeja is exploiting Siraj's cross-seam length by clearing his front leg early — the 'Invisible Shift' Siraj never saw coming.",
        "Siraj lowering release point slightly to stay under the eye-line, but losing control of the bounce on this slow track.",
        "Jadeja's footwork shift: stepping outside off-stump, converting yorkers to full-tosses. Siraj hasn't adjusted yet.",
        "RCB field placement exposes deep square leg — Jadeja is consciously using the angle to exploit that gap.",
    ],
};

export default matchData;
