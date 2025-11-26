document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const squatMaxInput = document.getElementById('squatMax');
    const benchMaxInput = document.getElementById('benchMax');
    const deadliftMaxInput = document.getElementById('deadliftMax');
    const ohpMaxInput = document.getElementById('ohpMax');
    const tmPercentSelect = document.getElementById('trainingMaxPercentage');
    const unitSelect = document.getElementById('unit');
    const roundToSelect = document.getElementById('roundTo');
    const calculateBtn = document.getElementById('calculateBtn');
    const resultsSection = document.getElementById('resultsSection');
    const progressCycleBtn = document.getElementById('progressCycleBtn');
    
    // Tables
    const squatTable = document.getElementById('squatTable').querySelector('tbody');
    const benchTable = document.getElementById('benchTable').querySelector('tbody');
    const deadliftTable = document.getElementById('deadliftTable').querySelector('tbody');
    const ohpTable = document.getElementById('ohpTable').querySelector('tbody');
    const boringTable = document.getElementById('boringTable').querySelector('tbody');
    
    // Training Max spans
    const squatTMSpan = document.getElementById('squatTM');
    const benchTMSpan = document.getElementById('benchTM');
    const deadliftTMSpan = document.getElementById('deadliftTM');
    const ohpTMSpan = document.getElementById('ohpTM');
    
    // FSL weights
    const fslSquatW1 = document.getElementById('fslSquatW1');
    const fslSquatW2 = document.getElementById('fslSquatW2');
    const fslSquatW3 = document.getElementById('fslSquatW3');
    const fslBenchW1 = document.getElementById('fslBenchW1');
    const fslBenchW2 = document.getElementById('fslBenchW2');
    const fslBenchW3 = document.getElementById('fslBenchW3');
    const fslDeadliftW1 = document.getElementById('fslDeadliftW1');
    const fslDeadliftW2 = document.getElementById('fslDeadliftW2');
    const fslDeadliftW3 = document.getElementById('fslDeadliftW3');
    const fslOhpW1 = document.getElementById('fslOhpW1');
    const fslOhpW2 = document.getElementById('fslOhpW2');
    const fslOhpW3 = document.getElementById('fslOhpW3');
    
    // Add event listeners for tab switching
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all tabs
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Hide all tab panes
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Show the corresponding tab content
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Add event listeners for accessory tabs
    document.querySelectorAll('.accessory-tab-btn').forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all accessory tabs
            document.querySelectorAll('.accessory-tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Hide all accessory panes
            document.querySelectorAll('.accessory-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Show the corresponding accessory content
            const accessoryType = this.getAttribute('data-accessory');
            document.getElementById(accessoryType + 'Content').classList.add('active');
        });
    });
    
    // Add click event to the calculate button
    calculateBtn.addEventListener('click', calculateProgram);
    
    // Add click event to the progress cycle button
    progressCycleBtn.addEventListener('click', progressCycle);
    
    // LocalStorage functions for PWA persistence
    function saveToLocalStorage() {
        const data = {
            squatMax: squatMaxInput.value,
            benchMax: benchMaxInput.value,
            deadliftMax: deadliftMaxInput.value,
            ohpMax: ohpMaxInput.value,
            tmPercent: tmPercentSelect.value,
            unit: unitSelect.value,
            roundTo: roundToSelect.value,
            hasCalculated: !resultsSection.classList.contains('hidden')
        };
        localStorage.setItem('wendler531Data', JSON.stringify(data));
    }
    
    function loadFromLocalStorage() {
        const savedData = localStorage.getItem('wendler531Data');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                
                // Restore input values
                if (data.squatMax) squatMaxInput.value = data.squatMax;
                if (data.benchMax) benchMaxInput.value = data.benchMax;
                if (data.deadliftMax) deadliftMaxInput.value = data.deadliftMax;
                if (data.ohpMax) ohpMaxInput.value = data.ohpMax;
                if (data.tmPercent) tmPercentSelect.value = data.tmPercent;
                if (data.unit) unitSelect.value = data.unit;
                if (data.roundTo) roundToSelect.value = data.roundTo;
                
                // If there was a calculation before, auto-calculate
                if (data.hasCalculated && data.squatMax && data.benchMax && data.deadliftMax && data.ohpMax) {
                    // Small delay to ensure DOM is ready
                    setTimeout(() => {
                        calculateProgram();
                    }, 100);
                }
            } catch (e) {
                console.error('Error loading saved data:', e);
            }
        }
    }
    
    // Load saved data on page load
    loadFromLocalStorage();
    
    // Save data whenever inputs change
    [squatMaxInput, benchMaxInput, deadliftMaxInput, ohpMaxInput, 
     tmPercentSelect, unitSelect, roundToSelect].forEach(element => {
        element.addEventListener('change', saveToLocalStorage);
        element.addEventListener('input', saveToLocalStorage);
    });
    
    function calculateProgram() {
        // Get values from inputs
        const squatMax = parseFloat(squatMaxInput.value);
        const benchMax = parseFloat(benchMaxInput.value);
        const deadliftMax = parseFloat(deadliftMaxInput.value);
        const ohpMax = parseFloat(ohpMaxInput.value);
        const tmPercent = parseFloat(tmPercentSelect.value);
        const unit = unitSelect.value;
        const roundTo = parseFloat(roundToSelect.value);
        
        // Validate inputs
        if (validateInputs([squatMax, benchMax, deadliftMax, ohpMax])) {
            // Calculate training maxes
            const squatTM = calculateTrainingMax(squatMax, tmPercent, roundTo);
            const benchTM = calculateTrainingMax(benchMax, tmPercent, roundTo);
            const deadliftTM = calculateTrainingMax(deadliftMax, tmPercent, roundTo);
            const ohpTM = calculateTrainingMax(ohpMax, tmPercent, roundTo);
            
            // Update training max displays
            squatTMSpan.textContent = `${squatTM} ${unit}`;
            benchTMSpan.textContent = `${benchTM} ${unit}`;
            deadliftTMSpan.textContent = `${deadliftTM} ${unit}`;
            ohpTMSpan.textContent = `${ohpTM} ${unit}`;
            
            // Generate program tables
            generateLifTable(squatTable, squatTM, unit, roundTo);
            generateLifTable(benchTable, benchTM, unit, roundTo);
            generateLifTable(deadliftTable, deadliftTM, unit, roundTo);
            generateLifTable(ohpTable, ohpTM, unit, roundTo);
            
            // Generate Boring But Big table
            generateBoringButBigTable(squatTM, benchTM, deadliftTM, ohpTM, unit, roundTo);
            
            // Generate FSL weights
            generateFSLWeights(squatTM, benchTM, deadliftTM, ohpTM, unit, roundTo);
            
            // Show results section
            resultsSection.classList.remove('hidden');
            
            // Save to localStorage after successful calculation
            saveToLocalStorage();
            
            // Scroll to results
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    function validateInputs(values) {
        // Check if any inputs are empty or not valid numbers
        for (const value of values) {
            if (isNaN(value) || value <= 0) {
                alert('Please enter valid numbers greater than 0 for all lifts.');
                return false;
            }
        }
        return true;
    }
    
    function calculateTrainingMax(oneRM, tmPercent, roundTo) {
        // Calculate TM and round to the nearest specified increment
        return roundWeight(oneRM * tmPercent, roundTo);
    }
    
    function generateLifTable(table, trainingMax, unit, roundTo) {
        // Clear existing table data
        table.innerHTML = '';
        
        // Define the 5/3/1 structure
        const program = [
            { week: 'Week 1 (5/5/5+)', sets: [ 
                { reps: '5', percentage: 0.65 },
                { reps: '5', percentage: 0.75 },
                { reps: '5+', percentage: 0.85 }
            ]},
            { week: 'Week 2 (3/3/3+)', sets: [ 
                { reps: '3', percentage: 0.70 },
                { reps: '3', percentage: 0.80 },
                { reps: '3+', percentage: 0.90 }
            ]},
            { week: 'Week 3 (5/3/1+)', sets: [ 
                { reps: '5', percentage: 0.75 },
                { reps: '3', percentage: 0.85 },
                { reps: '1+', percentage: 0.95 }
            ]},
            { week: 'Week 4 (Deload)', sets: [ 
                { reps: '5', percentage: 0.40 },
                { reps: '5', percentage: 0.50 },
                { reps: '5', percentage: 0.60 }
            ]}
        ];
        
        // Generate rows for each week
        program.forEach(week => {
            const row = document.createElement('tr');
            
            // Add week label
            const weekCell = document.createElement('td');
            weekCell.textContent = week.week;
            row.appendChild(weekCell);
            
            // Add sets
            week.sets.forEach(set => {
                const weight = roundWeight(trainingMax * set.percentage, roundTo);
                const setCell = document.createElement('td');
                setCell.textContent = `${set.reps} reps @ ${weight} ${unit}`;
                
                // Highlight AMRAP sets
                if (set.reps.includes('+')) {
                    setCell.classList.add('amrap-set');
                }
                
                row.appendChild(setCell);
            });
            
            // Add AMRAP note for non-deload weeks
            if (!week.week.includes('Deload')) {
                const amrapCell = document.createElement('td');
                amrapCell.textContent = 'Push for max quality reps on the final set';
                amrapCell.classList.add('amrap-note');
                row.appendChild(amrapCell);
            } else {
                const deloadCell = document.createElement('td');
                deloadCell.textContent = 'Focus on speed and technique';
                row.appendChild(deloadCell);
            }
            
            table.appendChild(row);
        });
    }
    
    function generateBoringButBigTable(squatTM, benchTM, deadliftTM, ohpTM, unit, roundTo) {
        // Clear existing table
        boringTable.innerHTML = '';
        
        // BBB uses 50-60% of TM for 5x10
        const bbbPercentage = 0.5;
        
        // Define the BBB structure
        const bbbProgram = [
            { day: 'Squat Day', exercise: 'Squat', tm: squatTM },
            { day: 'Bench Day', exercise: 'Bench Press', tm: benchTM },
            { day: 'Deadlift Day', exercise: 'Deadlift', tm: deadliftTM },
            { day: 'OHP Day', exercise: 'Overhead Press', tm: ohpTM }
        ];
        
        // Generate BBB table
        bbbProgram.forEach(day => {
            const row = document.createElement('tr');
            
            const dayCell = document.createElement('td');
            dayCell.textContent = day.day;
            row.appendChild(dayCell);
            
            const exerciseCell = document.createElement('td');
            exerciseCell.textContent = `${day.exercise} - 5 sets of 10 reps`;
            row.appendChild(exerciseCell);
            
            const weightCell = document.createElement('td');
            const bbbWeight = roundWeight(day.tm * bbbPercentage, roundTo);
            weightCell.textContent = `${bbbWeight} ${unit}`;
            row.appendChild(weightCell);
            
            boringTable.appendChild(row);
        });
    }
    
    function generateFSLWeights(squatTM, benchTM, deadliftTM, ohpTM, unit, roundTo) {
        // Week 1 - 65%
        fslSquatW1.textContent = roundWeight(squatTM * 0.65, roundTo) + ' ' + unit;
        fslBenchW1.textContent = roundWeight(benchTM * 0.65, roundTo) + ' ' + unit;
        fslDeadliftW1.textContent = roundWeight(deadliftTM * 0.65, roundTo) + ' ' + unit;
        fslOhpW1.textContent = roundWeight(ohpTM * 0.65, roundTo) + ' ' + unit;
        
        // Week 2 - 70%
        fslSquatW2.textContent = roundWeight(squatTM * 0.70, roundTo) + ' ' + unit;
        fslBenchW2.textContent = roundWeight(benchTM * 0.70, roundTo) + ' ' + unit;
        fslDeadliftW2.textContent = roundWeight(deadliftTM * 0.70, roundTo) + ' ' + unit;
        fslOhpW2.textContent = roundWeight(ohpTM * 0.70, roundTo) + ' ' + unit;
        
        // Week 3 - 75%
        fslSquatW3.textContent = roundWeight(squatTM * 0.75, roundTo) + ' ' + unit;
        fslBenchW3.textContent = roundWeight(benchTM * 0.75, roundTo) + ' ' + unit;
        fslDeadliftW3.textContent = roundWeight(deadliftTM * 0.75, roundTo) + ' ' + unit;
        fslOhpW3.textContent = roundWeight(ohpTM * 0.75, roundTo) + ' ' + unit;
    }
    
    function progressCycle() {
        // Get current values
        const squatTM = parseFloat(squatTMSpan.textContent);
        const benchTM = parseFloat(benchTMSpan.textContent);
        const deadliftTM = parseFloat(deadliftTMSpan.textContent);
        const ohpTM = parseFloat(ohpTMSpan.textContent);
        const unit = unitSelect.value;
        const roundTo = parseFloat(roundToSelect.value);
        
        if (isNaN(squatTM) || isNaN(benchTM) || isNaN(deadliftTM) || isNaN(ohpTM)) {
            alert('Please calculate your current cycle first.');
            return;
        }
        
        // Progress upper body lifts by 2.5kg/5lbs
        const upperIncrement = unit === 'kg' ? 2.5 : 5;
        
        // Progress lower body lifts by 5kg/10lbs
        const lowerIncrement = unit === 'kg' ? 5 : 10;
        
        // Calculate new training maxes
        const newSquatTM = roundWeight(squatTM + lowerIncrement, roundTo);
        const newBenchTM = roundWeight(benchTM + upperIncrement, roundTo);
        const newDeadliftTM = roundWeight(deadliftTM + lowerIncrement, roundTo);
        const newOhpTM = roundWeight(ohpTM + upperIncrement, roundTo);
        
        // Update training max displays
        squatTMSpan.textContent = `${newSquatTM} ${unit}`;
        benchTMSpan.textContent = `${newBenchTM} ${unit}`;
        deadliftTMSpan.textContent = `${newDeadliftTM} ${unit}`;
        ohpTMSpan.textContent = `${newOhpTM} ${unit}`;
        
        // Regenerate all tables with new values
        generateLifTable(squatTable, newSquatTM, unit, roundTo);
        generateLifTable(benchTable, newBenchTM, unit, roundTo);
        generateLifTable(deadliftTable, newDeadliftTM, unit, roundTo);
        generateLifTable(ohpTable, newOhpTM, unit, roundTo);
        
        // Regenerate Boring But Big table
        generateBoringButBigTable(newSquatTM, newBenchTM, newDeadliftTM, newOhpTM, unit, roundTo);
        
        // Regenerate FSL weights
        generateFSLWeights(newSquatTM, newBenchTM, newDeadliftTM, newOhpTM, unit, roundTo);
        
        // Show notification
        alert('Next cycle calculated! Training maxes have been increased.');
    }
    
    // Helper function to round weights to the nearest increment
    function roundWeight(weight, increment) {
        return Math.round(weight / increment) * increment;
    }
    
    // Allow pressing Enter to calculate
    [squatMaxInput, benchMaxInput, deadliftMaxInput, ohpMaxInput].forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculateBtn.click();
            }
        });
    });
    
    // Add event listeners for input validation
    [squatMaxInput, benchMaxInput, deadliftMaxInput, ohpMaxInput].forEach(input => {
        input.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9.]/g, '');
        });
    });
    
    // Add structured data for SEO
    function updateStructuredData() {
        const calculatorData = {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Wendler 5/3/1 Program Calculator",
            "applicationCategory": "CalculatorApplication",
            "operatingSystem": "Any",
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
            },
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "ratingCount": "218"
            }
        };
        
        // Create a script element
        let scriptElement = document.getElementById('calculatorSchema');
        if (!scriptElement) {
            scriptElement = document.createElement('script');
            scriptElement.id = 'calculatorSchema';
            scriptElement.type = 'application/ld+json';
            document.head.appendChild(scriptElement);
        }
        
        // Update the content
        scriptElement.textContent = JSON.stringify(calculatorData);
    }
    
    // Call the function to add structured data
    updateStructuredData();

        // 1RM Calculator Logic
    const rmWeightInput = document.getElementById('rm-weight');
    const rmRepsInput = document.getElementById('rm-reps');
    const rmFormulaSelect = document.getElementById('rm-formula');
    const calculate1RMBtn = document.getElementById('calculate1RMBtn');
    const rmResults = document.getElementById('rmResults');
    const rmResultValue = document.getElementById('rmResultValue');
    const useSquat1RMBtn = document.getElementById('useSquat1RMBtn');
    const useBench1RMBtn = document.getElementById('useBench1RMBtn');
    const useDL1RMBtn = document.getElementById('useDL1RMBtn');
    const useOHP1RMBtn = document.getElementById('useOHP1RMBtn');

    // 1RM calculation formulas
    function calculate1RM(weight, reps, formula) {
        weight = parseFloat(weight);
        reps = parseInt(reps);
        
        if (reps === 1) return weight;
        
        let result;
        switch(formula) {
            case 'epley':
                result = weight * (1 + reps/30);
                break;
            case 'brzycki':
                result = weight * (36 / (37 - reps));
                break;
            case 'lander':
                result = (100 * weight) / (101.3 - 2.67123 * reps);
                break;
            case 'lombardi':
                result = weight * Math.pow(reps, 0.10);
                break;
            case 'average':
                const epley = weight * (1 + reps/30);
                const brzycki = weight * (36 / (37 - reps));
                const lander = (100 * weight) / (101.3 - 2.67123 * reps);
                const lombardi = weight * Math.pow(reps, 0.10);
                result = (epley + brzycki + lander + lombardi) / 4;
                break;
            default:
                result = weight * (1 + reps/30);
        }
        
        return Math.round(result * 10) / 10;
    }

    calculate1RMBtn.addEventListener('click', function() {
        const weight = rmWeightInput.value;
        const reps = rmRepsInput.value;
        const formula = rmFormulaSelect.value;
        
        if (!weight || !reps) {
            alert('Please enter both weight and reps');
            return;
        }
        
        if (reps < 1 || reps > 15) {
            alert('Please enter reps between 1 and 15');
            return;
        }
        
        const oneRM = calculate1RM(weight, reps, formula);
        const unit = unitSelect.value;
        
        rmResultValue.textContent = `${oneRM} ${unit}`;
        rmResults.classList.remove('hidden');
    });

    // Use calculated 1RM in the main form
    useSquat1RMBtn.addEventListener('click', function() {
        const resultText = rmResultValue.textContent;
        const oneRM = parseFloat(resultText);
        
        if (!oneRM) return;
        
        squatMaxInput.value = oneRM;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    useBench1RMBtn.addEventListener('click', function() {
        const resultText = rmResultValue.textContent;
        const oneRM = parseFloat(resultText);
        
        if (!oneRM) return;
        
        benchMaxInput.value = oneRM;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    useDL1RMBtn.addEventListener('click', function() {
        const resultText = rmResultValue.textContent;
        const oneRM = parseFloat(resultText);
        
        if (!oneRM) return;
        
        deadliftMaxInput.value = oneRM;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    useOHP1RMBtn.addEventListener('click', function() {
        const resultText = rmResultValue.textContent;
        const oneRM = parseFloat(resultText);
        
        if (!oneRM) return;
        
        ohpMaxInput.value = oneRM;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

});