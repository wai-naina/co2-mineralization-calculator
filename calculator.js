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
    // USER INPUTS - These are the variables that change during testing
    const numBatches = parseFloat(document.getElementById('lab-batches').value);
    const blocksPerBatch = parseFloat(document.getElementById('lab-blocks-per-batch').value);
    
    // FIXED BATCH CONSTANTS (from SOP V2 - per batch)
    const batchVolume = 0.027; // m³ concrete per batch
    const cementPerBatch = 8.1; // kg cement per batch
    const waterPerBatch = 5.67; // L water per batch
    
    // DERIVED VALUES - Per block (calculated from batch values)
    const volume = batchVolume / blocksPerBatch; // m³ per block
    const cementPerBlock = cementPerBatch / blocksPerBatch; // kg per block
    const waterPerBlock = waterPerBatch / blocksPerBatch; // L per block
    
    // TOTAL PROJECT CALCULATIONS
    const totalBlocks = numBatches * blocksPerBatch;
    const totalVolume = numBatches * batchVolume;
    const totalCement = numBatches * cementPerBatch;
    const totalWater = numBatches * waterPerBatch;
    
    // CO2 CALCULATIONS
    const co2PerBlock = (cementPerBlock * dosage / 100);
    const co2PerBatch = (cementPerBatch * dosage / 100);
    const totalCO2 = totalCement * dosage / 100;
    const mineralizedCO2 = totalCO2 * efficiency;
    
    const requiredConcentration = (co2PerBlock * 1000) / waterPerBlock; // g/L
    
    return {
        // User inputs
        numBatches,
        blocksPerBatch,
        
        // Fixed batch constants
        batchVolume,
        cementPerBatch,
        waterPerBatch,
        
        // Per block values
        volume,
        cementPerBlock,
        waterPerBlock,
        co2PerBlock,
        
        // Per batch values
        co2PerBatch,
        
        // Total project values
        totalBlocks,
        totalVolume,
        totalCement,
        totalWater,
        totalCO2,
        mineralizedCO2,
        
        // Other calculations
        requiredConcentration,
        lostCO2: totalCO2 - mineralizedCO2,
        efficiencyPercent: efficiency * 100
    };
}

function calculateIndustrial(dosage, efficiency) {
    const annualVolume = parseFloat(document.getElementById('ind-volume').value);
    const cementPerM3 = parseFloat(document.getElementById('ind-cement').value);
    const operatingDays = parseFloat(document.getElementById('ind-days').value);
    
    // Get cement reduction factor
    const cementReduction = parseFloat(document.getElementById('cement-reduction').value);
    
    const totalCement = annualVolume * cementPerM3;
    const totalCO2 = totalCement * dosage / 100;
    const mineralizedCO2 = totalCO2 * efficiency;
    
    const dailyProduction = annualVolume / operatingDays;
    const dailyCO2 = totalCO2 / operatingDays;
    const dailyMineralized = mineralizedCO2 / operatingDays;
    
    // Calculate cement saved
    const cementSaved = totalCement * (cementReduction / 100);
    
    return {
        annualVolume,
        totalCement,
        totalCO2,
        mineralizedCO2,
        dailyProduction,
        dailyCO2,
        dailyMineralized,
        lostCO2: totalCO2 - mineralizedCO2,
        efficiencyPercent: efficiency * 100,
        cementReduction,
        cementSaved
    };
}

function displayResults(results, dosage) {
    let html = '<div class="results"><h3>📈 Results</h3>';
    
    if (currentTab === 'lab') {
        html += `
            <div class="results-section">
                <h4>🔢 Project Overview</h4>
                <div class="result-row">
                    <span class="result-label">Number of Batches</span>
                    <span class="result-value">${results.numBatches} batches</span>
                </div>
                <div class="result-row">
                    <span class="result-label">Blocks per Batch</span>
                    <span class="result-value">${results.blocksPerBatch} blocks</span>
                </div>
                <div class="result-row">
                    <span class="result-label">Total Blocks Produced</span>
                    <span class="result-value large">${results.totalBlocks} blocks</span>
                </div>
            </div>
            
            <div class="results-section">
                <h4>📦 Per Batch (Fixed - SOP V2)</h4>
                <div class="result-row">
                    <span class="result-label">Concrete Volume</span>
                    <span class="result-value">${results.batchVolume.toFixed(3)} m³</span>
                </div>
                <div class="result-row">
                    <span class="result-label">Cement Required</span>
                    <span class="result-value">${results.cementPerBatch.toFixed(2)} kg</span>
                </div>
                <div class="result-row">
                    <span class="result-label">Water Required</span>
                    <span class="result-value">${results.waterPerBatch.toFixed(2)} L</span>
                </div>
                <div class="result-row">
                    <span class="result-label">CO₂ Required</span>
                    <span class="result-value">${results.co2PerBatch.toFixed(4)} kg</span>
                </div>
            </div>
            
            <div class="results-section">
                <h4>🧱 Per Block (Calculated)</h4>
                <div class="result-row">
                    <span class="result-label">Block Volume</span>
                    <span class="result-value">${results.volume.toFixed(6)} m³</span>
                </div>
                <div class="result-row">
                    <span class="result-label">Cement per Block</span>
                    <span class="result-value">${results.cementPerBlock.toFixed(4)} kg</span>
                </div>
                <div class="result-row">
                    <span class="result-label">Water per Block</span>
                    <span class="result-value">${results.waterPerBlock.toFixed(5)} L</span>
                </div>
                <div class="result-row">
                    <span class="result-label">CO₂ per Block</span>
                    <span class="result-value">${results.co2PerBlock.toFixed(5)} kg</span>
                </div>
            </div>
            
            <div class="results-section">
                <h4>🎯 Total Project Requirements</h4>
                <div class="result-row">
                    <span class="result-label">Total Concrete Volume</span>
                    <span class="result-value">${results.totalVolume.toFixed(3)} m³</span>
                </div>
                <div class="result-row">
                    <span class="result-label">Total Cement</span>
                    <span class="result-value">${results.totalCement.toFixed(1)} kg</span>
                </div>
                <div class="result-row">
                    <span class="result-label">Total Water</span>
                    <span class="result-value">${results.totalWater.toFixed(1)} L</span>
                </div>
                <div class="result-row">
                    <span class="result-label">Total CO₂ Required</span>
                    <span class="result-value large">${results.totalCO2.toFixed(3)} kg</span>
                </div>
                <div class="result-row">
                    <span class="result-label">CO₂ Mineralized (${results.efficiencyPercent}% eff.)</span>
                    <span class="result-value">${results.mineralizedCO2.toFixed(3)} kg</span>
                </div>
                <div class="result-row">
                    <span class="result-label">CO₂ Lost to Atmosphere</span>
                    <span class="result-value">${results.lostCO2.toFixed(3)} kg</span>
                </div>
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
                <span class="result-label">Baseline Cement Usage</span>
                <span class="result-value">${(results.totalCement / 1000).toFixed(0)} tonnes/year</span>
            </div>
            <div class="result-row">
                <span class="result-label">Cement Saved (${results.cementReduction}% reduction)</span>
                <span class="result-value">${(results.cementSaved / 1000).toFixed(0)} tonnes/year</span>
            </div>
            <div class="result-row">
                <span class="result-label">Reduced Cement Usage</span>
                <span class="result-value">${((results.totalCement - results.cementSaved) / 1000).toFixed(0)} tonnes/year</span>
            </div>
        `;
    }
    
    html += '</div>';
    document.getElementById('results-container').innerHTML = html;
}

function displayCarbonationParams(dosage, results) {
    if (currentTab === 'lab') {
        // SOP V2 parameters based on exact dosage targets
        let temp, pressure, satTime, method, status, notes;
        
        if (dosage === 0) {
            temp = 'Ambient';
            pressure = 'N/A';
            satTime = 'N/A';
            method = 'Plain Water';
            status = 'Control';
            notes = 'Standard mixing with plain water at ambient lab temperature';
        } else if (dosage <= 0.5) {
            temp = 5;
            pressure = 4.0;
            satTime = 10;
            method = 'Surface Flood';
            status = 'Easily Achievable';
            notes = 'Comparable to highly carbonated soda. Standard injection into mixer.';
        } else if (dosage <= 1.0) {
            temp = 3;
            pressure = 6.0;
            satTime = 15;
            method = 'Subsurface Deep Lance';
            status = 'Technically Challenging';
            notes = 'Water near freezing required. Rapid mixing essential to prevent degassing. Inject pressurized water underneath aggregates.';
        } else if (dosage <= 1.3) {
            temp = 1;
            pressure = 7.5;
            satTime = 20;
            method = 'Hybrid/Vapor Containment';
            status = 'Thermodynamically Limited';
            notes = 'Maximum effort protocol. May fall slightly short of target. Requires pre-injection of gaseous CO₂ under tarp, supersaturated water injection, and mixing in CO₂-rich atmosphere.';
        } else {
            temp = 1;
            pressure = 7.5;
            satTime = 25;
            method = 'Hybrid/Vapor Containment';
            status = 'Beyond Recommended Range';
            notes = 'Exceeds safe operating limits. Hybrid injection required. Not recommended without specialized equipment.';
        }
        
        const statusClass = status === 'Easily Achievable' ? 'status-good' : 
                           status === 'Technically Challenging' ? 'status-warning' :
                           status === 'Control' ? 'status-control' : 'status-danger';
        
        const html = `
            <div class="concentration-info">
                <h4 style="margin-bottom: 0.75rem; color: var(--primary);">
                    🧪 Carbonation Parameters (SOP V2)
                </h4>
                <div class="status-badge ${statusClass}">
                    Status: ${status}
                </div>
                <div style="display: grid; gap: 0.5rem; margin-top: 1rem;">
                    <div><strong>Required Dissolved CO₂:</strong> ${results.requiredConcentration.toFixed(2)} g/L</div>
                    <div><strong>Pressure:</strong> ${pressure} ${typeof pressure === 'number' ? 'bar' : ''}</div>
                    <div><strong>Water Temperature:</strong> ${temp}${typeof temp === 'number' ? '°C' : ''}</div>
                    <div><strong>Saturation Time:</strong> ${satTime} ${typeof satTime === 'number' ? 'minutes' : ''}</div>
                    <div><strong>Injection Method:</strong> ${method}</div>
                </div>
                <div class="protocol-notes">
                    <strong>Protocol Notes:</strong> ${notes}
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