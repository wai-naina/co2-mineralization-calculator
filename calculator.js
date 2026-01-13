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
    
    let results, alerts;
    
    if (currentTab === 'lab') {
        results = calculateLab(dosage, efficiency);
    } else {
        results = calculateIndustrial(dosage, efficiency);
    }
    
    displayResults(results, dosage);
    displayAlerts(dosage, results);
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

function displayAlerts(dosage, results) {
    let html = '';
    
    if (dosage <= 0.3) {
        html += `
            <div class="alert alert-success">
                <span class="alert-icon">✅</span>
                <div>
                    <strong>Optimal Dosage Range</strong><br>
                    ${dosage}% bwc is within the scientifically validated optimal range (0.2-0.4%). 
                    Expected strength increase: +${dosage <= 0.2 ? '5-8' : '3-6'}%.
                </div>
            </div>
        `;
    } else if (dosage <= 0.4) {
        html += `
            <div class="alert alert-success">
                <span class="alert-icon">✅</span>
                <div>
                    <strong>Upper Optimal Range</strong><br>
                    ${dosage}% bwc is at the upper end of the optimal range. 
                    Expected strength: maintained or +2-4% increase.
                </div>
            </div>
        `;
    } else if (dosage <= 0.5) {
        html += `
            <div class="alert alert-warning">
                <span class="alert-icon">⚠️</span>
                <div>
                    <strong>Upper Boundary</strong><br>
                    ${dosage}% bwc is at the limit of safe operation. Some studies show benefits at 0.5%, 
                    others show beginning of competitive reactions. Expected strength: maintained to +3-5%.
                </div>
            </div>
        `;
    } else if (dosage <= 0.75) {
        html += `
            <div class="alert alert-warning">
                <span class="alert-icon">⚠️</span>
                <div>
                    <strong>High Risk Zone</strong><br>
                    ${dosage}% bwc exceeds the optimal range. Research shows competitive reactions begin. 
                    Expected strength: neutral to -5-10% reduction. C-S-H gel conversion to CaCO₃ may occur.
                </div>
            </div>
        `;
    } else if (dosage < 1.0) {
        html += `
            <div class="alert alert-danger">
                <span class="alert-icon">🚫</span>
                <div>
                    <strong>Significant Strength Loss Expected</strong><br>
                    ${dosage}% bwc is well beyond optimal. Studies document 10-15% strength reduction. 
                    Severe competitive reactions, poor pore structure, reduced workability.
                </div>
            </div>
        `;
    } else if (dosage <= 1.5) {
        html += `
            <div class="alert alert-danger">
                <span class="alert-icon">🚫</span>
                <div>
                    <strong>CRITICAL - Thermodynamic Limitations</strong><br>
                    ${dosage}% bwc requires ${results.requiredConcentration ? results.requiredConcentration.toFixed(1) : '~' + (dosage * 7.14).toFixed(1)} g/L dissolved CO₂ 
                    (${results.requiredPressure ? results.requiredPressure.toFixed(0) : '>' + Math.ceil(dosage * 7.5)} bar pressure). 
                    Studies show 15-20% strength reduction. Thermodynamically limited - near maximum solubility.
                </div>
            </div>
        `;
    } else {
        html += `
            <div class="alert alert-danger">
                <span class="alert-icon">🚫</span>
                <div>
                    <strong>Beyond Feasible Range</strong><br>
                    ${dosage}% bwc is beyond practical limits for concrete mineralization via mixing. 
                    Massive strength reduction expected (>20%).
                </div>
            </div>
        `;
    }
    
    // Add thermodynamic warning for high dosages in lab mode
    if (currentTab === 'lab' && dosage > 0.5 && results.requiredPressure > 7) {
        html += `
            <div class="alert alert-warning">
                <span class="alert-icon">⚙️</span>
                <div>
                    <strong>Equipment Limitation</strong><br>
                    Required pressure of ${results.requiredPressure.toFixed(1)} bar ${results.requiredPressure > 7.5 ? 'exceeds safe operating pressure (7.5 bar max)' : 'approaches maximum safe operating pressure'}. 
                    ${results.requiredPressure > 10 ? 'NOT ACHIEVABLE with current vessel design.' : 'Extreme degassing risk during discharge.'}
                </div>
            </div>
        `;
    }
    
    document.getElementById('alerts-container').innerHTML = html;
}

function displayCarbonationParams(dosage, results) {
    if (currentTab === 'lab') {
        // Map dosages to SOP parameters
        let temp, pressure, satTime, feasibility;
        
        if (dosage <= 0.2) {
            temp = 8;
            pressure = 2.5;
            satTime = 8;
            feasibility = 'Very High';
        } else if (dosage <= 0.3) {
            temp = 5;
            pressure = 3.5;
            satTime = 10;
            feasibility = 'Very High';
        } else if (dosage <= 0.4) {
            temp = 5;
            pressure = 4.5;
            satTime = 12;
            feasibility = 'High';
        } else if (dosage <= 0.5) {
            temp = 5;
            pressure = 4.0;
            satTime = 10;
            feasibility = 'Medium';
        } else if (dosage <= 0.75) {
            temp = 3;
            pressure = 5.5;
            satTime = 15;
            feasibility = 'Medium-Low';
        } else if (dosage <= 1.0) {
            temp = 3;
            pressure = 6.0;
            satTime = 15;
            feasibility = 'Low';
        } else if (dosage <= 1.5) {
            temp = 1;
            pressure = 7.5;
            satTime = 20;
            feasibility = 'Very Low';
        } else {
            temp = 1;
            pressure = 7.5;
            satTime = 25;
            feasibility = 'Very Low';
        }
        
        const badge = dosage <= 0.3 ? '<span class="badge badge-optimal">OPTIMAL</span>' : 
                      dosage <= 0.4 ? '<span class="badge badge-optimal">GOOD</span>' :
                      dosage <= 0.5 ? '<span class="badge badge-risky">RISKY</span>' : 
                      '<span class="badge badge-notrecommended">HIGH RISK</span>';
        
        const html = `
            <div class="concentration-info">
                <h4 style="margin-bottom: 0.75rem; color: var(--primary);">
                    🧪 Carbonation Parameters ${badge}
                </h4>
                <div style="display: grid; gap: 0.5rem;">
                    <div><strong>Required Dissolved CO₂:</strong> ${results.requiredConcentration.toFixed(2)} g/L</div>
                    <div><strong>Pressure:</strong> ${pressure.toFixed(1)} bar</div>
                    <div><strong>Water Temperature:</strong> ${temp}°C</div>
                    <div><strong>Saturation Time:</strong> ${satTime} minutes</div>
                    <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #ddd;">
                        <strong>Feasibility:</strong> ${feasibility}
                    </div>
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
