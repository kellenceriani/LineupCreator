(() => {
  const categories = [
    "Superheroes", "Mario Characters", "TV Characters", "Dog Breeds", "Famous Scientists",
    "Movie Villains", "Mythical Creatures", "Star Wars Characters", "Pokemon", "NBA Legends"
  ];

  const lineups = [
    "Basketball Starting 5 (PG, SG, SF, PF, C)",
    "Soccer Starting 11 (GK, RB, CB, CB2, LB, CM, CDM, CAM, RW, LW, ST)",
    "Baseball Starting 1-9 + SP (CF, LF, RF, 2B, 3B, SS, 1B, C, DH, SP)",
    "American Football Offense (QB, RB, WR, TE, OL)",
    "Hockey Starting 6 (LW, C, RW, LD, RD, G)",
    "Esports Team (Top, Jungle, Mid, ADC, Support)",
    "Volleyball Starting 6 (Setter, Outside Hitter, Middle Blocker, Opposite Hitter, Libero, Defensive Specialist)",
  ];

  const lineupPrompts = {
    "Basketball Starting 5 (PG, SG, SF, PF, C)": `Evaluate each drafted basketball lineup. Analyze position fit, offensive/defensive balance, chemistry, and overall basketball IQ. Assign an NBA 2K-style OVR rating to each player and determine which team would dominate on the court.`,
    "Soccer Starting XI (GK, RB, CB, CB2, LB, CM, CDM, CAM, RW, LW, ST)": `Review each soccer lineup. Consider player synergy, formation logic, positional strengths, and overall team chemistry. Rate individual players on skill and role-fit, and crown the best football squad.`,
    "Baseball Starting 1-9 + SP (CF, LF, RF, 2B, 3B, SS, 1B, C, DH, SP)": `Evaluate the following baseball lineups by doing player-to-player matchups and positional fits. Judge each team on chemistry, talent, lineup construction sensibility, and more. Assign MLB The Show-style OVRs to each player and declare the strongest roster.`,
    "American Football Offense (QB, RB, WR, TE, OL)": `Break down each football offensive lineup. Consider the versatility, playmaking, blocking synergy, and quarterback leadership. Rate each player as in Madden, then decide which offense would be most unstoppable on the field.`,
    "Hockey Starting 6 (LW, C, RW, LD, RD, G)": `Analyze each hockey team. Evaluate skating ability, positional coverage, puck control, chemistry, and goalie reliability. Assign NHL-style ratings and determine which team would rule the rink.`,
    "Esports Team (Top, Jungle, Mid, ADC, Support)": `Judge the composition of each esports team, focusing on meta relevance, role synergy, mechanical skill, and strategic balance. Assign each player an OVR like in League of Legends rankings and determine the superior team.`,
    "Volleyball Starting 6 (Setter, Outside Hitter, Middle Blocker, Opposite Hitter, Libero, Defensive Specialist)": `Assess each volleyball lineup. Evaluate height, agility, communication, and role coverage. Rate each player's skill level and synergy, then decide which team would dominate a match.`
  };

  const lineupPositionCounts = {
    "Basketball Starting 5 (PG, SG, SF, PF, C)": 5,
    "Soccer Starting XI (GK, RB, CB, CB2, LB, CM, CDM, CAM, RW, LW, ST)": 11,
    "Baseball Starting 1-9 + SP (CF, LF, RF, 2B, 3B, SS, 1B, C, DH, SP)": 10,
    "American Football Offense (QB, RB, WR, TE, OL)": 5,
    "Hockey Starting 6 (LW, C, RW, LD, RD, G)": 6,
    "Esports Team (Top, Jungle, Mid, ADC, Support)": 5,
    "Volleyball Starting 6 (Setter, Outside Hitter, Middle Blocker, Opposite Hitter, Libero, Defensive Specialist)": 6,
  };

  const playerCountInput = document.getElementById("playerCount");
  const playersContainer = document.getElementById("playersContainer");
  const categoryInput = document.getElementById("categoryInput");
  const lineupSelect = document.getElementById("lineupSelect");
  const startDraftBtn = document.getElementById("startDraftBtn");

  const setupSection = document.getElementById("setup");
  const draftSection = document.getElementById("draftSection");
  const categoryDisplay = document.getElementById("categoryDisplay");
  const lineupDisplay = document.getElementById("lineupDisplay");
  const draftInfo = document.getElementById("draftInfo");
  const draftArea = document.getElementById("draftArea");
  const finishDraftBtn = document.getElementById("finishDraftBtn");

  const resultSection = document.getElementById("resultSection");
  const promptOutput = document.getElementById("promptOutput");
  const copyPromptBtn = document.getElementById("copyPromptBtn");
  const chatgptLink = document.getElementById("chatgptLink");

  let players = [];
  let category = "";
  let lineup = "";
  let positions = [];
  let currentPlayerIndex = 0;
  let totalPicksMade = 0;
  let totalDraftRounds = 0;
  let drafting = false;

  function renderPlayerInputs() {
    playersContainer.innerHTML = "";
    let count = +playerCountInput.value;
    count = Math.max(2, Math.min(count, 8));

    for (let i = 1; i <= count; i++) {
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = `Player ${i} Name`;
      input.className = "playerNameInput";
      input.dataset.index = i - 1;
      playersContainer.appendChild(input);
    }
  }
  playerCountInput.addEventListener("input", renderPlayerInputs);
  renderPlayerInputs();

  function parsePositions(lineupStr) {
    const m = lineupStr.match(/\(([^)]+)\)/);
    if (m) {
      return m[1].split(",").map(s => s.trim());
    }
    return lineupStr.split(/[\s,]+/).filter(p => p.length > 0);
  }

  function validatePositions(positions) {
    const clean = [...new Set(positions.filter(p => p && p.length > 0))];
    return clean.length > 0 ? clean : ["Position 1", "Position 2", "Position 3"];
  }
  function nextPlayerTurn() {
currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  }
  
function renderDraftArea() {
  draftArea.innerHTML = "";
  const isBaseball = lineup.includes("Baseball");

  // For baseball: define batting order spots 1-9 (except for SP)
  const battingOrderSpots = Array.from({length:9}, (_, i) => (i+1).toString());

  players.forEach((player, idx) => {
    const div = document.createElement("div");
    div.className = "playerDraft";
    div.dataset.playerIndex = idx;

    const title = document.createElement("h4");
    title.textContent = player.name;
    div.appendChild(title);

    const ul = document.createElement("ul");
    ul.className = "draftList";
    player.lineup.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item.character;
      if (item.position) {
        const posSpan = document.createElement("span");
        posSpan.className = "pos";
        posSpan.textContent = item.position;
        li.appendChild(posSpan);
      }
      if (isBaseball && item.battingOrder) {
        const orderSpan = document.createElement("span");
        orderSpan.className = "battingOrder";
        orderSpan.textContent = ` (Batting Order: ${item.battingOrder})`;
        li.appendChild(orderSpan);
      }
      ul.appendChild(li);
    });
    div.appendChild(ul);

    if (idx === currentPlayerIndex && drafting) {
      const form = document.createElement("form");
      form.className = "draftForm";

      // Character input
      const charInput = document.createElement("input");
      charInput.type = "text";
      charInput.placeholder = `Character / Item`;
      charInput.name = "character";
      charInput.required = true;
      form.appendChild(charInput);

      // Position input
      const posInput = document.createElement("input");
      posInput.type = "text";
      posInput.placeholder = "Position (optional)";
      posInput.name = "position";
      posInput.list = "positionsList";
      form.appendChild(posInput);

      // Baseball batting order input, conditional
      let battingOrderInput = null;
      if (isBaseball) {
        battingOrderInput = document.createElement("select");
        battingOrderInput.name = "battingOrder";
        battingOrderInput.required = true;
        battingOrderInput.style.marginLeft = "8px";

        // default option
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "-- Batting Order --";
        battingOrderInput.appendChild(defaultOption);

        // Filter available batting spots (exclude ones taken already)
const takenOrders = player.lineup.map(i => i.battingOrder).filter(Boolean);
const availableOrders = battingOrderSpots.filter(o => !takenOrders.includes(o));

availableOrders.forEach(order => {
  const opt = document.createElement("option");
  opt.value = order;
  opt.textContent = order;
  battingOrderInput.appendChild(opt);
});

// Add "10 (SP)" if not already taken
const hasSP = player.lineup.some(i => i.position?.toUpperCase() === "SP");
if (!hasSP && !takenOrders.includes("10")) {
  const spOption = document.createElement("option");
  spOption.value = "10";
  spOption.textContent = "10 (SP)";
  battingOrderInput.appendChild(spOption);
}


        form.appendChild(battingOrderInput);
      }

      // Submit button
      const submitBtn = document.createElement("button");
      submitBtn.type = "submit";
      submitBtn.textContent = "Add";
      form.appendChild(submitBtn);

      form.addEventListener("submit", e => {
        e.preventDefault();
        const char = charInput.value.trim();
        if (!char) return;

        let pos = posInput.value.trim();

        // For Baseball, ensure position and batting order input
        let battingOrder = null;
        if (isBaseball) {
          battingOrder = battingOrderInput.value;

          if (!pos) {
            alert("Please enter the position for Baseball.");
            return;
          }

if (pos.toUpperCase() === "SP") {
  if (battingOrder !== "10") {
    alert('SP must have batting order "10".');
    return;
  }
} else {
  if (!battingOrder || battingOrder === "10") {
    alert("Please select a valid batting order spot (1-9) for this position.");
    return;
  }
}

        } else {
          // Non-baseball fallback: use existing logic to assign position if blank
          const playerPositions = players[idx].lineup.map(i => i.position);
          const availablePositions = positions.filter(p => !playerPositions.includes(p));
          if (!pos) pos = availablePositions.length > 0 ? availablePositions[0] : "";
        }

        // Validate unique position within this player's lineup
        const playerPositions = players[idx].lineup.map(i => i.position);
        if (pos && playerPositions.includes(pos)) {
          alert(`Position "${pos}" already taken in your lineup.`);
          return;
        }

        // For baseball, validate batting order uniqueness
        if (isBaseball && battingOrder) {
          const playerBattingOrders = players[idx].lineup.map(i => i.battingOrder).filter(Boolean);
          if (playerBattingOrders.includes(battingOrder)) {
            alert(`Batting order spot "${battingOrder}" already taken in your lineup.`);
            return;
          }
        }

        players[idx].lineup.push({ character: char, position: pos, battingOrder: battingOrder });
        totalPicksMade++;

        if (totalPicksMade >= totalDraftRounds) {
          endDraft();
          return;
        }

        nextPlayerTurn();
        renderDraftArea();
      });

      div.appendChild(form);
    }

    draftArea.appendChild(div);
  });

  // Update positions datalist as before...
  let datalist = document.getElementById("positionsList");
  if (!datalist) {
    datalist = document.createElement("datalist");
    datalist.id = "positionsList";
    document.body.appendChild(datalist);
  }
  datalist.innerHTML = "";
  positions.forEach(pos => {
    const opt = document.createElement("option");
    opt.value = pos;
    datalist.appendChild(opt);
  });
}


  function endDraft() {
    drafting = false;
    finishDraftBtn.classList.remove("hidden");
    renderDraftArea();
  }

  startDraftBtn.addEventListener("click", () => {
    const playerNameInputs = document.querySelectorAll(".playerNameInput");
    players = Array.from(playerNameInputs).map(input => ({
      name: input.value.trim() || `Player ${+input.dataset.index + 1}`,
      lineup: []
    }));

    category = categoryInput.value.trim() || categories[Math.floor(Math.random() * categories.length)];
    categoryDisplay.textContent = category;

    lineup = lineupSelect.value;
    if (!lineup) {
      alert("Please select a lineup type.");
      return;
    }

    lineupDisplay.textContent = lineup;

    positions = validatePositions(parsePositions(lineup));
    maxPicksPerTeam = positions.length;
    totalDraftRounds = maxPicksPerTeam * players.length;
    currentPlayerIndex = 0;
    totalPicksMade = 0;
    drafting = true;

    setupSection.classList.add("hidden");
    draftSection.classList.remove("hidden");
    finishDraftBtn.classList.add("hidden");

    renderDraftArea();
  });

  finishDraftBtn.addEventListener("click", () => {
    resultSection.classList.remove("hidden");
    draftSection.classList.add("hidden");

const isBaseball = lineup.includes("Baseball");

const playerSummaries = players.map(player => {
  const lines = [`\n${player.name}'s Team:`];

  // Find the pitcher (SP)
  const pitcher = player.lineup.find(pick => 
    isBaseball && pick.position && pick.position.toLowerCase() === "sp"
  );

  if (pitcher) {
    lines.push(`- ${pitcher.character} (${pitcher.position})`);
  }

  // Filter out the pitcher and sort the rest by battingOrder
  const batters = player.lineup
    .filter(pick => !(isBaseball && pick.position && pick.position.toLowerCase() === "sp"))
    .sort((a, b) => a.battingOrder - b.battingOrder);

  // Add numbered batting order
  batters.forEach(pick => {
    if (pick.position && pick.battingOrder) {
      lines.push(`${pick.battingOrder}. ${pick.character} (${pick.position})`);
    }
  });

  return lines.join("\n");
});


    const evaluationPrompt = lineupPrompts[lineup] || `Analyze the following drafted teams for balance, creativity, and effectiveness. Rate each player and team performance.`;

    const prompt = `${evaluationPrompt}\n\nCategory: ${category}\nLineup: ${lineup}\n\n${playerSummaries}`;
    promptOutput.value = prompt;
  });

  copyPromptBtn.addEventListener("click", () => {
    promptOutput.select();
    document.execCommand("copy");
  });
})();