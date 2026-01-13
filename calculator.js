let currentTab = 'lab';

function switchTab(tab) {
    currentTab = tab;
    
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tab}-tab`).classList.add('active');
    
    calculate();
}

function setDosage(value) {
    document.getElementById('dosage').value = value;
    
    // Update button states
    document.querySelectorAll('.dosage-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    calculate();
}

function calculate() {
    const dosage = parseFloat(document.getElementById('dosage').value);
    const efficiency = parseFloat(document.getElementById('efficiency').value) / 100;
    
    let results;
    
    if (currentTab === 'lab') {
        results = calculateLab(dosage, efficiency);
    } else {
        results = calculateIndustrial(dosage, efficiency);
    }
    
    displayResults(results, dosage);
    displayCarbonationParams(dosage, results);
}

function calculateLab(dosage, efficiency) {
    const blocks = parseFloat(document.getElementById('lab-blocks').value);
    const volume = parseFloat(document.getElementById('lab-volume').value);
    const cementPerBlock = parseFloat(document.getElementById('lab-cement').value);
    const waterPerBlock = parseFloat(document.getElementById('lab-water').value);
    
    const totalCement = blocks * cementPerBlock;
    const totalWater = blocks * waterPerBlock;
    const totalVolume = blocks * volume;
    
    const co2PerBlock = (cementPerBlock * dosage / 100);
    const totalCO2 = totalCement * dosage / 100;
    const mineralizedCO2 = totalCO2 * efficiency;
    
    const requiredConcentration = (co2PerBlock * 1000) / waterPerBlock; // g/L
    
    // Henry's Law estimation for required pressure
    const temperature = 5; // °C (assumed)
    const henryConstant = 0.034 * Math.exp(-2400 * (1/(temperature + 273.15) - 1/298.15)); // mol/(L·atm) adjusted for temp
    const requiredPressure = requiredConcentration / (henryConstant * 44 * 1000); // bar (approximate)
    
    return {
        blocks,
        totalCement,
        totalWater,
        totalVolume,
        co2PerBlock,
        totalCO2,
        mineralizedCO2,
        requiredConcentration,
        requiredPressure,
        lostCO2: totalCO2 - mineralizedCO2,
        efficiencyPercent: efficiency * 100
    };
}

function calculateIndustrial(dosage, efficiency) {
    const annualVolume = parseFloat(document.getElementById('ind-volume').value);
    const cementPerM3 = parseFloat(document.getElementById('ind-cement').value);
    const operatingDays = parseFloat(document.getElementById('ind-days').value);
    
    const totalCement = annualVolume * cementPerM3;
    const totalCO2 = totalCement * dosage / 100;
    const mineralizedCO2 = totalCO2 * efficiency;
    
    const dailyProduction = annualVolume / operatingDays;
    const dailyCO2 = totalCO2 / operatingDays;
    const dailyMineralized = mineralizedCO2 / operatingDays;
    
    return {
        annualVolume,
        totalCement,
        totalCO2,
        mineralizedCO2,
        dailyProduction,
        dailyCO2,
        dailyMineralized,
        lostCO2: totalCO2 - mineralizedCO2,
        efficiencyPercent: efficiency * 100
    };
}

function displayResults(results, dosage) {
    let html = '<div class="results"><h3>📈 Results</h3>';
    
    if (currentTab === 'lab') {
        html += `
            <div class="result-row">
                <span class="result-label">CO₂ per Block</span>
                <span class="result-value">${results.co2PerBlock.toFixed(3)} kg</span>
            </div>
            <div class="result-row">
                <span class="result-label">Total CO₂ Required</span>
                <span class="result-value large">${results.totalCO2.toFixed(2)} kg</span>
            </div>
            <div class="result-row">
                <span class="result-label">CO₂ Mineralized (${results.efficiencyPercent}% eff.)</span>
                <span class="result-value">${results.mineralizedCO2.toFixed(2)} kg</span>
            </div>
            <div class="result-row">
                <span class="result-label">CO₂ Lost to Atmosphere</span>
                <span class="result-value">${results.lostCO2.toFixed(2)} kg</span>
            </div>
            <div class="result-row">
                <span class="result-label">Total Cement</span>
                <span class="result-value">${results.totalCement.toFixed(0)} kg</span>
            </div>
            <div class="result-row">
                <span class="result-label">Total Water</span>
                <span class="result-value">${results.totalWater.toFixed(0)} L</span>
            </div>
        `;
    } else {
        html += `
            <div class="result-row">
                <span class="result-label">Annual CO₂ Injected</span>
                <span class="result-value large">${(results.totalCO2 / 1000).toFixed(1)} tonnes</span>
            </div>
            <div class="result-row">
                <span class="result-label">CO₂ Mineralized (${results.efficiencyPercent}% eff.)</span>
                <span class="result-value">${(results.mineralizedCO2 / 1000).toFixed(1)} tonnes/year</span>
            </div>
            <div class="result-row">
                <span class="result-label">CO₂ Lost to Atmosphere</span>
                <span class="result-value">${(results.lostCO2 / 1000).toFixed(1)} tonnes/year</span>
            </div>
            <div class="result-row">
                <span class="result-label">Daily CO₂ Required</span>
                <span class="result-value">${results.dailyCO2.toFixed(0)} kg/day</span>
            </div>
            <div class="result-row">
                <span class="result-label">Daily CO₂ Mineralized</span>
                <span class="result-value">${results.dailyMineralized.toFixed(0)} kg/day</span>
            </div>
            <div class="result-row">
                <span class="result-label">Daily Production</span>
                <span class="result-value">${results.dailyProduction.toFixed(0)} m³/day</span>
            </div>
            <div class="result-row">
                <span class="result-label">Total Cement Used</span>
                <span class="result-value">${(results.totalCement / 1000).toFixed(0)} tonnes/year</span>
            </div>
        `;
    }
    
    html += '</div>';
    document.getElementById('results-container').innerHTML = html;
}

function displayCarbonationParams(dosage, results) {
    if (currentTab === 'lab') {
        // Map dosages to SOP parameters
        let temp, pressure, satTime;
        
        if (dosage <= 0.2) {
            temp = 10;
            pressure = 1.6;
            satTime = 7;
        } else if (dosage <= 0.3) {
            temp = 8;
            pressure = 2.4;
            satTime = 8;
        } else if (dosage <= 0.4) {
            temp = 6;
            pressure = 3.2;
            satTime = 9;
        } else if (dosage <= 0.5) {
            temp = 5;
            pressure = 4.0;
            satTime = 10;
        } else if (dosage <= 0.75) {
            temp = 4;
            pressure = 5;
            satTime = 12.5;
        } else if (dosage <= 1.0) {
            temp = 3;
            pressure = 6.0;
            satTime = 15;
        } else if (dosage <= 1.25) {
            temp = 2;
            pressure = 6.75;
            satTime = 17.5;
        } else if (dosage <= 1.5) {
            temp = 1;
            pressure = 7.5;
            satTime = 20;
        } else {
            temp = 1;
            pressure = 7.5;
            satTime = 25;
        }
        
        const html = `
            <div class="concentration-info">
                <h4 style="margin-bottom: 0.75rem; color: var(--primary);">
                    🧪 Carbonation Parameters
                </h4>
                <div style="display: grid; gap: 0.5rem;">
                    <div><strong>Required Dissolved CO₂:</strong> ${results.requiredConcentration.toFixed(2)} g/L</div>
                    <div><strong>Pressure:</strong> ${pressure.toFixed(1)} bar</div>
                    <div><strong>Water Temperature:</strong> ${temp}°C</div>
                    <div><strong>Saturation Time:</strong> ${satTime} minutes</div>
                </div>
            </div>
        `;
        
        document.getElementById('carbonation-params').innerHTML = html;
    } else {
        document.getElementById('carbonation-params').innerHTML = '';
    }
}

// Initial calculation on page load
document.addEventListener('DOMContentLoaded', function() {
    calculate();
});