const taxForm = document.getElementById('tax-form');
const resultDiv = document.getElementById('result');
const taxableIncomeSpan = document.getElementById('taxable-income');
const totalTaxSpan = document.getElementById('total-tax');
const effectiveTaxRateSpan = document.getElementById('effective-tax-rate');
const taxBreakdownDiv = document.getElementById('tax-breakdown');
const dobInput = document.getElementById('dob');
const ageInput = document.getElementById('age');

const taxSlabs = [
    { limit: 300000, rate: 0 },
    { limit: 600000, rate: 0.05 },
    { limit: 900000, rate: 0.10 },
    { limit: 1200000, rate: 0.15 },
    { limit: 1500000, rate: 0.20 },
    { limit: Infinity, rate: 0.30 }
];

dobInput.addEventListener('change', calculateAge);

function calculateAge() {
    const dob = new Date(dobInput.value);
    const today = new Date();
    const currentFY = today.getMonth() >= 3 ? today.getFullYear() + 1 : today.getFullYear();
    const fyEndDate = new Date(currentFY, 2, 31); // March 31st of the current financial year

    let age = fyEndDate.getFullYear() - dob.getFullYear();
    const monthDiff = fyEndDate.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && fyEndDate.getDate() < dob.getDate())) {
        age--;
    }

    ageInput.value = age;
}

taxForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const income = parseFloat(document.getElementById('income').value);
    const age = parseInt(document.getElementById('age').value);
    const standardDeduction = parseFloat(document.getElementById('standard-deduction').value);
    const otherDeductions = parseFloat(document.getElementById('other-deductions').value);

    const taxableIncome = Math.max(0, income - standardDeduction - otherDeductions);
    const { totalTax, taxBreakdown } = calculateTax(taxableIncome, age);
    const effectiveTaxRate = (totalTax / income) * 100;

    displayResults(taxableIncome, totalTax, effectiveTaxRate, taxBreakdown);
});

function calculateTax(taxableIncome, age) {
    let remainingIncome = taxableIncome;
    let totalTax = 0;
    const taxBreakdown = [];

    for (const slab of taxSlabs) {
        if (remainingIncome > 0) {
            const taxableAmount = Math.min(remainingIncome, slab.limit - (taxBreakdown.length > 0 ? taxSlabs[taxBreakdown.length - 1].limit : 0));
            const taxForSlab = taxableAmount * slab.rate;
            totalTax += taxForSlab;
            taxBreakdown.push({
                slab: `₹${taxBreakdown.length > 0 ? taxSlabs[taxBreakdown.length - 1].limit + 1 : 0} - ₹${slab.limit === Infinity ? 'Above' : slab.limit}`,
                rate: `${slab.rate * 100}%`,
                tax: taxForSlab
            });
            remainingIncome -= taxableAmount;
        } else {
            break;
        }
    }

    // Apply tax rebate for income up to 7 lakhs
    if (taxableIncome <= 700000) {
        totalTax = Math.max(0, totalTax - 25000);
    }

    // Apply additional deduction for senior citizens (age 60 and above)
    if (age >= 60) {
        totalTax = Math.max(0, totalTax - 50000);
    }

    return { totalTax, taxBreakdown };
}

function displayResults(taxableIncome, totalTax, effectiveTaxRate, taxBreakdown) {
    taxableIncomeSpan.textContent = `₹${taxableIncome.toFixed(2)}`;
    totalTaxSpan.textContent = `₹${totalTax.toFixed(2)}`;
    effectiveTaxRateSpan.textContent = `${effectiveTaxRate.toFixed(2)}%`;

    taxBreakdownDiv.innerHTML = '';
    taxBreakdown.forEach(slab => {
        const slabDiv = document.createElement('div');
        slabDiv.classList.add('tax-slab');
        slabDiv.innerHTML = `
            <span>${slab.slab}</span>
            <span>${slab.rate}</span>
            <span>₹${slab.tax.toFixed(2)}</span>
        `;
        taxBreakdownDiv.appendChild(slabDiv);
    });

    resultDiv.classList.remove('hidden');
}