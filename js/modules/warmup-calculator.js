// Warm-Up Calculator Module
// Starting Strength methodology for workout warm-up sets
(function() {
    'use strict';

    window.WarmUp = {
        // Default gym configuration
        config: {
            barWeight: 35,
            plates: {
                45: 2, 35: 0, 25: 2, 15: 2, 10: 4, 5: 2, 2.5: 2,
                1: 2, 0.75: 2, 0.5: 2, 0.25: 2
            }
        },

        standardPlates: [45, 35, 25, 15, 10, 5, 2.5],
        microPlates: [1, 0.75, 0.5, 0.25],

        init: function() {
            this.loadConfig();
            this.renderPlateConfig();
            this.bindEvents();

            // Load last target weight
            const lastWeight = localStorage.getItem('lastTargetWeight');
            if (lastWeight) {
                document.getElementById('target-weight').value = lastWeight;
            }

            // Load deadlift mode state
            const deadliftMode = localStorage.getItem('deadliftMode');
            if (deadliftMode === 'true') {
                document.getElementById('deadlift-mode').checked = true;
            }
        },

        loadConfig: function() {
            const saved = localStorage.getItem('gymConfig');
            if (saved) {
                this.config = JSON.parse(saved);
            }
            document.getElementById('bar-weight-display').textContent = this.config.barWeight;
        },

        saveConfig: function() {
            localStorage.setItem('gymConfig', JSON.stringify(this.config));
            const btn = document.getElementById('save-config');
            btn.textContent = 'Saved!';
            btn.classList.add('saved');
            setTimeout(() => {
                btn.textContent = 'Save Configuration';
                btn.classList.remove('saved');
            }, 2000);
        },

        renderPlateConfig: function() {
            const standardContainer = document.getElementById('standard-plates');
            const microContainer = document.getElementById('micro-plates');

            standardContainer.innerHTML = this.standardPlates.map(weight =>
                this.createPlateRow(weight)
            ).join('');

            microContainer.innerHTML = this.microPlates.map(weight =>
                this.createPlateRow(weight)
            ).join('');
        },

        createPlateRow: function(weight) {
            const count = this.config.plates[weight] || 0;
            return `
                <div class="plate-row">
                    <span class="plate-label">${weight}</span>
                    <div class="plate-controls">
                        <button class="plate-adjust" data-plate="${weight}" data-action="dec">−</button>
                        <span class="plate-count" id="plate-${weight}">${count}</span>
                        <button class="plate-adjust" data-plate="${weight}" data-action="inc">+</button>
                    </div>
                </div>
            `;
        },

        bindEvents: function() {
            // Calculate button
            document.getElementById('calculate-warmup').addEventListener('click', () => this.calculate());

            // Weight adjustment buttons
            document.getElementById('weight-up').addEventListener('click', () => {
                const input = document.getElementById('target-weight');
                input.value = parseFloat(input.value) + 5;
            });
            document.getElementById('weight-down').addEventListener('click', () => {
                const input = document.getElementById('target-weight');
                input.value = Math.max(this.config.barWeight, parseFloat(input.value) - 5);
            });

            // Enter key to calculate
            document.getElementById('target-weight').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.calculate();
            });

            // Save deadlift mode preference
            document.getElementById('deadlift-mode').addEventListener('change', (e) => {
                localStorage.setItem('deadliftMode', e.target.checked);
            });

            // Config toggle
            document.getElementById('config-toggle').addEventListener('click', () => {
                document.getElementById('config-toggle').classList.toggle('open');
                document.getElementById('plate-config').classList.toggle('open');
            });

            // Plate adjustments
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('plate-adjust')) {
                    const plate = parseFloat(e.target.dataset.plate);
                    const action = e.target.dataset.action;
                    const bar = e.target.dataset.bar;

                    if (bar) {
                        this.config.barWeight = Math.max(15, Math.min(55, this.config.barWeight + parseInt(bar)));
                        document.getElementById('bar-weight-display').textContent = this.config.barWeight;
                    } else if (plate) {
                        if (action === 'inc') {
                            this.config.plates[plate] = (this.config.plates[plate] || 0) + 1;
                        } else {
                            this.config.plates[plate] = Math.max(0, (this.config.plates[plate] || 0) - 1);
                        }
                        document.getElementById(`plate-${plate}`).textContent = this.config.plates[plate];
                    }
                }
            });

            // Save config
            document.getElementById('save-config').addEventListener('click', () => this.saveConfig());
        },

        // Calculate plate combination for a given weight
        // useMicros: true for work sets, false for warm-ups
        calculatePlates: function(targetWeight, useMicros = true) {
            const perSide = (targetWeight - this.config.barWeight) / 2;
            if (perSide <= 0) return { plates: [], total: this.config.barWeight };

            // For warm-ups, only use standard plates; for work sets, use all
            const platesToUse = useMicros
                ? [...this.standardPlates, ...this.microPlates]
                : [...this.standardPlates];
            const allPlates = platesToUse.sort((a, b) => b - a);

            const result = [];
            let remaining = perSide;
            const available = { ...this.config.plates };

            for (const plate of allPlates) {
                while (remaining >= plate && (available[plate] || 0) > 0) {
                    result.push(plate);
                    remaining -= plate;
                    available[plate]--;
                }
            }

            const actualPerSide = result.reduce((a, b) => a + b, 0);
            return {
                plates: result,
                total: this.config.barWeight + actualPerSide * 2
            };
        },

        // Generate all subset combinations of work plates
        // Returns array of {plates: [...], weight: number}
        generatePlateSubsets: function(workPlates) {
            const bar = this.config.barWeight;
            const subsets = [{ plates: [], weight: bar }];

            // Generate power set
            for (const plate of workPlates) {
                const newSubsets = subsets.map(s => ({
                    plates: [...s.plates, plate],
                    weight: s.weight + plate * 2
                }));
                subsets.push(...newSubsets);
            }

            // Remove duplicates and sort by weight
            const seen = new Set();
            return subsets
                .filter(s => {
                    const key = s.weight;
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                })
                .sort((a, b) => a.weight - b.weight);
        },

        // Find best subset weight for target percentage
        findBestSubset: function(subsets, targetWeight, actualWork, prevWeight) {
            let best = null;
            let bestDiff = Infinity;

            for (const subset of subsets) {
                // Skip if too close to previous or work weight
                if (subset.weight <= prevWeight + 5) continue;
                if (subset.weight >= actualWork - 5) continue;

                const diff = Math.abs(subset.weight - targetWeight);
                if (diff < bestDiff) {
                    bestDiff = diff;
                    best = subset;
                }
            }
            return best;
        },

        // Helper to add a warm-up set with proper reps
        addWarmupSet: function(warmupSets, weight, plates, actualWork) {
            const pct = Math.round((weight / actualWork) * 100);

            // Determine reps: 5, 3, or 1 only
            let reps;
            if (pct <= 55) reps = 5;
            else if (pct <= 75) reps = 3;
            else reps = 1;

            warmupSets.push({
                weight: weight,
                percentage: pct,
                sets: 1,
                reps: reps,
                plates: plates
            });
        },

        // Calculate warm-up sets using subset-first approach (minimize plate removal)
        calculate: function() {
            const targetInput = document.getElementById('target-weight');
            const targetWeight = parseFloat(targetInput.value);

            if (isNaN(targetWeight) || targetWeight < this.config.barWeight) {
                alert(`Please enter a weight of at least ${this.config.barWeight} lbs (bar weight)`);
                return;
            }

            localStorage.setItem('lastTargetWeight', targetWeight);

            // Calculate work set plates first (with micros)
            const workSet = this.calculatePlates(targetWeight, true);
            const actualWork = workSet.total;

            // Generate all possible subset weights from work plates (no plate removal needed)
            // Use only standard plates for warm-up subsets
            const workPlatesStandard = workSet.plates.filter(p => this.standardPlates.includes(p));
            const subsets = this.generatePlateSubsets(workPlatesStandard);

            const warmupSets = [];

            // Check if deadlift mode is enabled
            const isDeadlift = document.getElementById('deadlift-mode').checked;

            // Determine starting warm-up
            if (isDeadlift) {
                // Deadlift mode: start with higher weight based on work weight
                const startWeight = actualWork <= 250 ? 85 : 125;
                const startPlates = this.calculatePlates(startWeight, false);
                warmupSets.push({
                    weight: startPlates.total,
                    percentage: Math.round((startPlates.total / actualWork) * 100),
                    sets: 1,
                    reps: 5,
                    plates: startPlates.plates,
                    isBar: false
                });
            } else {
                // Normal mode: start with empty bar
                warmupSets.push({
                    weight: this.config.barWeight,
                    percentage: Math.round((this.config.barWeight / actualWork) * 100),
                    sets: 2,
                    reps: 5,
                    plates: [],
                    isBar: true
                });
            }

            // Warm-up constraints:
            // - 3-4 warm-up sets (including bar)
            // - Last warm-up must be 80-89% of target
            // - First jump (from bar) can be up to 40%, others max 25%
            // - Earlier jumps should be larger than later jumps
            const maxWarmups = 4;
            const minWarmups = 3;
            const minLastPct = 0.80;  // Last warm-up must be at least 80%
            const maxLastPct = 0.89;  // Last warm-up must be BELOW 90%
            const maxFirstJumpPct = 0.40;  // First jump (from bar) can be larger
            const maxJumpPct = 0.25;  // Max 25% jump for other sets

            // Target percentages: evenly spread up to ~85%
            const targetPercentages = [0.4, 0.55, 0.7, 0.85];

            // First pass: try subset-only (no plate removal)
            for (const pct of targetPercentages) {
                if (warmupSets.length >= maxWarmups) break;

                const targetWarmup = Math.round(actualWork * pct);
                const subset = this.findBestSubset(subsets, targetWarmup, actualWork,
                    warmupSets[warmupSets.length - 1].weight);

                // Only use if within 15% of target AND below 90% threshold
                if (subset &&
                    Math.abs(subset.weight - targetWarmup) <= actualWork * 0.15 &&
                    subset.weight < actualWork * maxLastPct) {
                    this.addWarmupSet(warmupSets, subset.weight, subset.plates, actualWork);
                }
            }

            // Second pass: fill with non-subset weights until we have 4
            const fillPercentages = [0.45, 0.55, 0.65, 0.75, 0.85];
            for (const pct of fillPercentages) {
                if (warmupSets.length >= minWarmups) break;

                const targetWarmup = Math.round(actualWork * pct);

                // Skip if we already have something within 10% of this target
                const exists = warmupSets.some(s =>
                    Math.abs(s.percentage - pct * 100) <= 10
                );
                if (exists) continue;

                const plateResult = this.calculatePlates(targetWarmup, false);

                // Must be below 90%, not too close to existing, and valid range
                const tooClose = warmupSets.some(s =>
                    Math.abs(s.weight - plateResult.total) <= 10
                );

                if (!tooClose &&
                    plateResult.total > this.config.barWeight + 5 &&
                    plateResult.total < actualWork * maxLastPct) {
                    this.addWarmupSet(warmupSets, plateResult.total, plateResult.plates, actualWork);
                }
            }

            // Sort warm-ups by weight
            const barSet = warmupSets.shift();
            warmupSets.sort((a, b) => a.weight - b.weight);
            warmupSets.unshift(barSet);

            // Third pass: check for large gaps and fill them
            let hasLargeGap = true;
            while (hasLargeGap && warmupSets.length < maxWarmups + 2) {
                hasLargeGap = false;

                for (let i = 0; i < warmupSets.length - 1; i++) {
                    const current = warmupSets[i];
                    const next = warmupSets[i + 1];
                    const gapPct = (next.weight - current.weight) / actualWork;
                    // First jump (from bar) can be larger
                    const maxAllowedGap = (i === 0) ? maxFirstJumpPct : maxJumpPct;

                    if (gapPct > maxAllowedGap) {
                        // Found a large gap, try to fill it
                        const midWeight = Math.round((current.weight + next.weight) / 2);
                        const plateResult = this.calculatePlates(midWeight, false);

                        if (plateResult.total > current.weight + 10 &&
                            plateResult.total < next.weight - 10 &&
                            plateResult.total < actualWork * maxLastPct) {
                            this.addWarmupSet(warmupSets, plateResult.total, plateResult.plates, actualWork);
                            hasLargeGap = true;

                            // Re-sort after adding
                            const bar = warmupSets.shift();
                            warmupSets.sort((a, b) => a.weight - b.weight);
                            warmupSets.unshift(bar);
                            break;
                        }
                    }
                }
            }

            // Trim to max 4 warm-ups (keep bar + highest 3)
            while (warmupSets.length > maxWarmups) {
                warmupSets.splice(1, 1);  // Remove lowest non-bar
            }

            // Ensure last warm-up is in 80%-90% range
            const lastNonBar = warmupSets.filter(s => !s.isBar).pop();
            if (lastNonBar) {
                const lastPct = lastNonBar.weight / actualWork;

                // If last warm-up is below 80%, add one in range (don't remove yet)
                if (lastPct < minLastPct) {
                    for (const targetPct of [0.85, 0.82]) {
                        const targetWeight = Math.round(actualWork * targetPct);
                        const plateResult = this.calculatePlates(targetWeight, false);
                        const pct = plateResult.total / actualWork;

                        if (pct >= minLastPct && pct < maxLastPct &&
                            plateResult.total > lastNonBar.weight) {
                            // Add without removing - let gap detection and trim handle it
                            this.addWarmupSet(warmupSets, plateResult.total, plateResult.plates, actualWork);

                            // Re-sort
                            const bar = warmupSets.shift();
                            warmupSets.sort((a, b) => a.weight - b.weight);
                            warmupSets.unshift(bar);
                            break;
                        }
                    }
                }
            }

            // Re-run gap detection after adding 80-90% warm-up
            hasLargeGap = true;
            while (hasLargeGap && warmupSets.length < maxWarmups + 2) {
                hasLargeGap = false;
                for (let i = 0; i < warmupSets.length - 1; i++) {
                    const current = warmupSets[i];
                    const next = warmupSets[i + 1];
                    const gapPct = (next.weight - current.weight) / actualWork;
                    const maxAllowedGap = (i === 0) ? maxFirstJumpPct : maxJumpPct;

                    if (gapPct > maxAllowedGap) {
                        const midWeight = Math.round((current.weight + next.weight) / 2);
                        const plateResult = this.calculatePlates(midWeight, false);

                        if (plateResult.total > current.weight + 10 &&
                            plateResult.total < next.weight - 10 &&
                            plateResult.total < actualWork * maxLastPct) {
                            this.addWarmupSet(warmupSets, plateResult.total, plateResult.plates, actualWork);
                            hasLargeGap = true;
                            const bar = warmupSets.shift();
                            warmupSets.sort((a, b) => a.weight - b.weight);
                            warmupSets.unshift(bar);
                            break;
                        }
                    }
                }
            }

            // Trim to max 4 warm-ups (keep bar and highest, remove from middle)
            while (warmupSets.length > maxWarmups) {
                // Find the warm-up whose removal causes least jump disruption
                // Remove the one that creates the smallest resulting gap
                let bestRemoveIdx = 1;
                let smallestResultingJump = Infinity;

                for (let i = 1; i < warmupSets.length - 1; i++) {
                    const before = warmupSets[i - 1].weight;
                    const after = warmupSets[i + 1].weight;
                    const resultingJump = after - before;
                    if (resultingJump < smallestResultingJump) {
                        smallestResultingJump = resultingJump;
                        bestRemoveIdx = i;
                    }
                }
                warmupSets.splice(bestRemoveIdx, 1);
            }

            // Ensure earlier jumps are larger than later jumps
            // Remove warm-ups that break this pattern (keep bar and last)
            let jumpsValid = false;
            while (!jumpsValid && warmupSets.length > minWarmups) {
                jumpsValid = true;
                const jumps = [];

                // Calculate all jumps
                for (let i = 0; i < warmupSets.length - 1; i++) {
                    jumps.push(warmupSets[i + 1].weight - warmupSets[i].weight);
                }

                // Check if jumps are decreasing (earlier >= later)
                for (let i = 0; i < jumps.length - 1; i++) {
                    if (jumps[i] < jumps[i + 1]) {
                        // Later jump is larger than earlier jump
                        // Remove the START of the small jump to merge with previous jump
                        let removeIdx = i;

                        // But don't remove bar (index 0) or last warm-up
                        if (removeIdx === 0) removeIdx = 1;
                        if (removeIdx >= warmupSets.length - 1) removeIdx = warmupSets.length - 2;

                        if (removeIdx > 0 && removeIdx < warmupSets.length - 1) {
                            warmupSets.splice(removeIdx, 1);
                            jumpsValid = false;
                            break;
                        }
                    }
                }
            }

            // Force last warm-up to 1 rep
            if (warmupSets.length > 1) {
                const lastWarmup = warmupSets[warmupSets.length - 1];
                if (!lastWarmup.isBar) {
                    lastWarmup.reps = 1;
                }
            }

            // Add work set
            warmupSets.push({
                weight: targetWeight,  // Show target weight, not calculated weight
                actualWeight: actualWork,  // Store actual achievable weight
                percentage: 100,
                sets: 3,
                reps: 5,
                plates: workSet.plates,
                isWork: true
            });

            this.renderSets(warmupSets, targetWeight);
        },

        // Calculate plate changes between sets
        getPlateChanges: function(prevPlates, currentPlates) {
            const prevCount = {};
            const currCount = {};

            prevPlates.forEach(p => prevCount[p] = (prevCount[p] || 0) + 1);
            currentPlates.forEach(p => currCount[p] = (currCount[p] || 0) + 1);

            const allPlates = [...new Set([...prevPlates, ...currentPlates])].sort((a, b) => b - a);
            const add = [];
            const remove = [];

            for (const plate of allPlates) {
                const diff = (currCount[plate] || 0) - (prevCount[plate] || 0);
                if (diff > 0) {
                    for (let i = 0; i < diff; i++) add.push(plate);
                } else if (diff < 0) {
                    for (let i = 0; i < -diff; i++) remove.push(plate);
                }
            }

            return { add, remove };
        },

        renderSets: function(sets, targetWeight) {
            const container = document.getElementById('warmup-sets');
            let html = '';

            for (let i = 0; i < sets.length; i++) {
                const set = sets[i];
                const prevPlates = i > 0 ? sets[i - 1].plates : [];
                const changes = this.getPlateChanges(prevPlates, set.plates);

                const label = set.isWork ? 'WORK SET' : set.isBar ? 'WARM-UP 1' : `WARM-UP ${i + 1}`;
                const cardClass = set.isWork ? 'warmup-set-card work-set' : 'warmup-set-card';

                // Show note if actual weight differs from target (for work set)
                let weightNote = '';
                if (set.isWork && set.actualWeight && set.actualWeight !== set.weight) {
                    weightNote = `<div class="weight-note">Actual with plates: ${set.actualWeight} lbs</div>`;
                }

                html += `
                    <div class="${cardClass}">
                        <div class="set-header">
                            <span class="set-label">${label}</span>
                            <span class="set-percentage">${set.percentage}%</span>
                        </div>
                        <div class="set-weight">${set.weight} <span class="unit">lbs</span></div>
                        ${weightNote}
                        <div class="set-progress">
                            <div class="set-progress-fill" style="width: ${set.percentage}%"></div>
                        </div>
                        <div class="set-details">
                            <span class="set-reps">${set.sets} × ${set.reps} <span>reps</span></span>
                        </div>
                        ${this.renderPlateChanges(set, changes, i === 0)}
                    </div>
                `;
            }

            container.innerHTML = html;
        },

        renderPlateChanges: function(set, changes, isFirst) {
            if (isFirst) {
                return `
                    <div class="plate-changes">
                        <div class="plate-change none">Empty bar</div>
                    </div>
                `;
            }

            let html = '<div class="plate-changes">';

            if (changes.add.length > 0) {
                const grouped = this.groupPlates(changes.add);
                html += `<div class="plate-change add">➕ Add: ${grouped} each side</div>`;
            }

            if (changes.remove.length > 0) {
                const grouped = this.groupPlates(changes.remove);
                html += `<div class="plate-change remove">➖ Remove: ${grouped} each side</div>`;
            }

            if (changes.add.length === 0 && changes.remove.length === 0) {
                html += `<div class="plate-change none">No plate changes</div>`;
            }

            html += '</div>';
            return html;
        },

        groupPlates: function(plates) {
            const counts = {};
            plates.forEach(p => counts[p] = (counts[p] || 0) + 1);
            return Object.entries(counts)
                .sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]))
                .map(([plate, count]) => count > 1 ? `${count}×${plate}` : plate)
                .join(' + ');
        },

        // Test function to verify all rules
        runTests: function() {
            const testWeights = [95, 115, 135, 155, 185, 205, 225, 275, 315];
            const results = [];

            console.log('=== WARM-UP CALCULATOR TESTS ===\n');

            for (const target of testWeights) {
                const workSet = this.calculatePlates(target, true);
                const actualWork = workSet.total;
                const bar = this.config.barWeight;

                // Simulate calculation (simplified)
                const workPlatesStandard = workSet.plates.filter(p => this.standardPlates.includes(p));
                const subsets = this.generatePlateSubsets(workPlatesStandard);

                // Run the same algorithm as calculate()
                const warmupSets = [{ weight: bar, isBar: true }];
                const maxWarmups = 4, minWarmups = 3;
                const minLastPct = 0.80, maxLastPct = 0.89;
                const maxFirstJumpPct = 0.40, maxJumpPct = 0.25;
                const targetPercentages = [0.4, 0.55, 0.7, 0.85];

                // First pass
                for (const pct of targetPercentages) {
                    if (warmupSets.length >= maxWarmups) break;
                    const targetWarmup = Math.round(actualWork * pct);
                    const subset = this.findBestSubset(subsets, targetWarmup, actualWork, warmupSets[warmupSets.length - 1].weight);
                    if (subset && Math.abs(subset.weight - targetWarmup) <= actualWork * 0.15 && subset.weight < actualWork * maxLastPct) {
                        warmupSets.push({ weight: subset.weight, plates: subset.plates });
                    }
                }

                // Second pass
                const fillPercentages = [0.45, 0.55, 0.65, 0.75, 0.85];
                for (const pct of fillPercentages) {
                    if (warmupSets.length >= minWarmups) break;
                    const targetWarmup = Math.round(actualWork * pct);
                    const exists = warmupSets.some(s => Math.abs((s.weight / actualWork) * 100 - pct * 100) <= 10);
                    if (exists) continue;
                    const plateResult = this.calculatePlates(targetWarmup, false);
                    const tooClose = warmupSets.some(s => Math.abs(s.weight - plateResult.total) <= 10);
                    if (!tooClose && plateResult.total > bar + 5 && plateResult.total < actualWork * maxLastPct) {
                        warmupSets.push({ weight: plateResult.total, plates: plateResult.plates });
                    }
                }

                // Sort
                const barSet = warmupSets.shift();
                warmupSets.sort((a, b) => a.weight - b.weight);
                warmupSets.unshift(barSet);

                // Third pass - gap fill
                let hasLargeGap = true;
                while (hasLargeGap && warmupSets.length < maxWarmups + 2) {
                    hasLargeGap = false;
                    for (let i = 0; i < warmupSets.length - 1; i++) {
                        const gapPct = (warmupSets[i + 1].weight - warmupSets[i].weight) / actualWork;
                        const maxAllowedGap = (i === 0) ? maxFirstJumpPct : maxJumpPct;
                        if (gapPct > maxAllowedGap) {
                            const midWeight = Math.round((warmupSets[i].weight + warmupSets[i + 1].weight) / 2);
                            const plateResult = this.calculatePlates(midWeight, false);
                            if (plateResult.total > warmupSets[i].weight + 10 && plateResult.total < warmupSets[i + 1].weight - 10 && plateResult.total < actualWork * maxLastPct) {
                                warmupSets.push({ weight: plateResult.total, plates: plateResult.plates });
                                hasLargeGap = true;
                                const b = warmupSets.shift();
                                warmupSets.sort((a, b) => a.weight - b.weight);
                                warmupSets.unshift(b);
                                break;
                            }
                        }
                    }
                }

                // First trim
                while (warmupSets.length > maxWarmups) warmupSets.splice(1, 1);

                // Ensure last 80-90% (add without removing)
                const lastNonBar = warmupSets.filter(s => !s.isBar).pop();
                if (lastNonBar && lastNonBar.weight / actualWork < minLastPct) {
                    for (const targetPct of [0.85, 0.82]) {
                        const targetWeight = Math.round(actualWork * targetPct);
                        const plateResult = this.calculatePlates(targetWeight, false);
                        const pct = plateResult.total / actualWork;
                        if (pct >= minLastPct && pct < maxLastPct && plateResult.total > lastNonBar.weight) {
                            warmupSets.push({ weight: plateResult.total, plates: plateResult.plates });
                            const b = warmupSets.shift();
                            warmupSets.sort((a, b) => a.weight - b.weight);
                            warmupSets.unshift(b);
                            break;
                        }
                    }
                }

                // Re-run gap detection after 80-90%
                hasLargeGap = true;
                while (hasLargeGap && warmupSets.length < maxWarmups + 2) {
                    hasLargeGap = false;
                    for (let i = 0; i < warmupSets.length - 1; i++) {
                        const gapPct = (warmupSets[i + 1].weight - warmupSets[i].weight) / actualWork;
                        const maxAllowedGap = (i === 0) ? maxFirstJumpPct : maxJumpPct;
                        if (gapPct > maxAllowedGap) {
                            const midWeight = Math.round((warmupSets[i].weight + warmupSets[i + 1].weight) / 2);
                            const plateResult = this.calculatePlates(midWeight, false);
                            if (plateResult.total > warmupSets[i].weight + 10 && plateResult.total < warmupSets[i + 1].weight - 10 && plateResult.total < actualWork * maxLastPct) {
                                warmupSets.push({ weight: plateResult.total, plates: plateResult.plates });
                                hasLargeGap = true;
                                const b = warmupSets.shift();
                                warmupSets.sort((a, b) => a.weight - b.weight);
                                warmupSets.unshift(b);
                                break;
                            }
                        }
                    }
                }

                // Smart trim to max 4
                while (warmupSets.length > maxWarmups) {
                    let bestIdx = 1, smallestGap = Infinity;
                    for (let i = 1; i < warmupSets.length - 1; i++) {
                        const gap = warmupSets[i + 1].weight - warmupSets[i - 1].weight;
                        if (gap < smallestGap) { smallestGap = gap; bestIdx = i; }
                    }
                    warmupSets.splice(bestIdx, 1);
                }

                // Ensure decreasing jumps (use removeIdx = i, not i+1)
                let jumpsValid = false;
                while (!jumpsValid && warmupSets.length > minWarmups) {
                    jumpsValid = true;
                    const jumps = [];
                    for (let i = 0; i < warmupSets.length - 1; i++) {
                        jumps.push(warmupSets[i + 1].weight - warmupSets[i].weight);
                    }
                    for (let i = 0; i < jumps.length - 1; i++) {
                        if (jumps[i] < jumps[i + 1]) {
                            let removeIdx = i;  // Changed from i+1
                            if (removeIdx === 0) removeIdx = 1;
                            if (removeIdx >= warmupSets.length - 1) removeIdx = warmupSets.length - 2;
                            if (removeIdx > 0 && removeIdx < warmupSets.length - 1) {
                                warmupSets.splice(removeIdx, 1);
                                jumpsValid = false;
                                break;
                            }
                        }
                    }
                }

                // Verify rules
                const weights = warmupSets.map(s => s.weight);
                const jumps = [];
                for (let i = 0; i < weights.length - 1; i++) {
                    jumps.push(weights[i + 1] - weights[i]);
                }
                const jumpPcts = jumps.map(j => (j / actualWork * 100).toFixed(1) + '%');
                const lastWarmup = weights[weights.length - 1];
                const lastPct = lastWarmup / actualWork;

                const errors = [];
                // Rule 1: 3-4 warm-ups
                if (warmupSets.length < 3 || warmupSets.length > 4) errors.push(`Count: ${warmupSets.length} (expected 3-4)`);
                // Rule 2: Last warm-up 80-89%
                if (lastPct < 0.80 || lastPct >= 0.90) errors.push(`Last: ${(lastPct * 100).toFixed(1)}% (expected 80-89%)`);
                // Rule 3: First jump ≤40%, others ≤25%
                for (let i = 0; i < jumps.length; i++) {
                    const pct = jumps[i] / actualWork;
                    const max = i === 0 ? 0.40 : 0.25;
                    if (pct > max) errors.push(`Jump ${i + 1}: ${(pct * 100).toFixed(1)}% > ${max * 100}%`);
                }
                // Rule 4: Earlier jumps >= later jumps
                for (let i = 0; i < jumps.length - 1; i++) {
                    if (jumps[i] < jumps[i + 1]) errors.push(`Jump ${i + 1} (${jumps[i]}) < Jump ${i + 2} (${jumps[i + 1]})`);
                }

                const status = errors.length === 0 ? '✓ PASS' : '✗ FAIL';
                console.log(`Target: ${target} lbs (actual: ${actualWork} lbs)`);
                console.log(`  Warm-ups: ${weights.join(' → ')} → ${actualWork} (work)`);
                console.log(`  Jumps: ${jumpPcts.join(', ')}`);
                console.log(`  Last warm-up: ${(lastPct * 100).toFixed(1)}%`);
                console.log(`  ${status}${errors.length ? ': ' + errors.join(', ') : ''}`);
                console.log('');

                results.push({ target, actual: actualWork, pass: errors.length === 0, errors });
            }

            const passed = results.filter(r => r.pass).length;
            console.log(`=== RESULTS: ${passed}/${results.length} passed ===`);
            return results;
        }
    };
})();
