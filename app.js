// GPA grading logic and calculator behaviors for the GPA Calculator homepage.

const LETTER_GRADE_GPA = {
  'A+': 4.0,
  'A': 4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2.0,
  'C-': 1.7,
  'D+': 1.3,
  'D': 1.0,
  'F': 0.0,
};

function calculateGrade(value) {
  if (typeof value === 'string') {
    const grade = value.trim();
    if (!LETTER_GRADE_GPA.hasOwnProperty(grade)) {
      throw new Error('Invalid letter grade');
    }
    return { letterGrade: grade, gpa: LETTER_GRADE_GPA[grade] };
  }

  const numericScore = Number(value);
  if (!Number.isFinite(numericScore) || numericScore < 0 || numericScore > 100) {
    throw new Error('Invalid score');
  }

  if (numericScore >= 97) return { letterGrade: 'A+', gpa: 4.0 };
  if (numericScore >= 93) return { letterGrade: 'A', gpa: 4.0 };
  if (numericScore >= 90) return { letterGrade: 'A-', gpa: 3.7 };
  if (numericScore >= 87) return { letterGrade: 'B+', gpa: 3.3 };
  if (numericScore >= 83) return { letterGrade: 'B', gpa: 3.0 };
  if (numericScore >= 80) return { letterGrade: 'B-', gpa: 2.7 };
  if (numericScore >= 77) return { letterGrade: 'C+', gpa: 2.3 };
  if (numericScore >= 73) return { letterGrade: 'C', gpa: 2.0 };
  if (numericScore >= 70) return { letterGrade: 'C-', gpa: 1.7 };
  if (numericScore >= 67) return { letterGrade: 'D+', gpa: 1.3 };
  if (numericScore >= 65) return { letterGrade: 'D', gpa: 1.0 };
  return { letterGrade: 'F', gpa: 0.0 };
}

function formatNumber(value, decimals = 2) {
  return Number(value).toFixed(decimals);
}

function getCourseRows() {
  return Array.from(document.querySelectorAll('.course-row')).map(row => ({
    course: row.querySelector('input[name="course"]').value.trim(),
    credits: Number(row.querySelector('input[name="credits"]').value),
    letterGrade: row.querySelector('select[name="letterGrade"]').value,
  }));
}

function validatePreviousRecord(previousGpa, previousCredits) {
  if (previousGpa !== '' && (!Number.isFinite(previousGpa) || previousGpa < 0 || previousGpa > 4)) {
    throw new Error('Previous GPA must be a number between 0.0 and 4.0.');
  }
  if (previousCredits !== '' && (!Number.isFinite(previousCredits) || previousCredits < 0 || !Number.isInteger(previousCredits))) {
    throw new Error('Previous credits must be a whole number greater than or equal to 0.');
  }
}

function validateCourseRow(row, index) {
  if (!row.course) {
    throw new Error(`Course name is required for row ${index + 1}.`);
  }
  if (!Number.isFinite(row.credits) || row.credits <= 0) {
    throw new Error(`Credits must be a positive number for row ${index + 1}.`);
  }
  if (!row.letterGrade || !LETTER_GRADE_GPA.hasOwnProperty(row.letterGrade)) {
    throw new Error(`Select a valid letter grade for row ${index + 1}.`);
  }
}

function calculateSemesterGPA(semesterCourses) {
  if (!semesterCourses.length) {
    throw new Error('Add at least one current semester course.');
  }

  let semesterQualityPoints = 0;
  let semesterCredits = 0;

  semesterCourses.forEach((row, index) => {
    validateCourseRow(row, index);
    const courseGrade = calculateGrade(row.letterGrade);
    semesterCredits += row.credits;
    semesterQualityPoints += courseGrade.gpa * row.credits;
  });

  return {
    semesterCredits,
    semesterQualityPoints,
    semesterGpa: semesterQualityPoints / semesterCredits,
  };
}

function calculateNewCGPA(previousGPA, previousCredits, semesterCourses) {
  const previousQualityPoints = previousGPA * previousCredits;
  const semesterResult = calculateSemesterGPA(semesterCourses);
  const totalCredits = previousCredits + semesterResult.semesterCredits;
  const totalQualityPoints = previousQualityPoints + semesterResult.semesterQualityPoints;
  const newCgpa = totalCredits === 0 ? 0 : totalQualityPoints / totalCredits;

  return {
    previousQualityPoints,
    semesterQualityPoints: semesterResult.semesterQualityPoints,
    totalCredits,
    totalQualityPoints,
    newCgpa,
    semesterGpa: semesterResult.semesterGpa,
    semesterCredits: semesterResult.semesterCredits,
  };
}

function updateResultPanel(summary) {
  document.getElementById('resultGpa').textContent = formatNumber(summary.semesterGpa, 2);
  document.getElementById('resultPreviousGpa').textContent = formatNumber(summary.previousGpa, 2);
  document.getElementById('resultNewCgpa').textContent = formatNumber(summary.newCgpa, 2);
  document.getElementById('resultPreviousCredits').textContent = formatNumber(summary.previousCredits, 0);
  document.getElementById('resultSemesterCredits').textContent = formatNumber(summary.semesterCredits, 1);
  document.getElementById('resultTotalCredits').textContent = formatNumber(summary.totalCredits, 1);
  document.getElementById('resultSemesterPoints').textContent = formatNumber(summary.semesterQualityPoints, 1);
  document.getElementById('resultPreviousPoints').textContent = formatNumber(summary.previousQualityPoints, 1);
  document.getElementById('resultTotalPoints').textContent = formatNumber(summary.totalQualityPoints, 1);
  document.getElementById('heroGpa').textContent = formatNumber(summary.semesterGpa, 2);
  document.getElementById('heroCredits').textContent = formatNumber(summary.semesterCredits, 1);
}

function getPreviousRecord() {
  const previousGpaInput = document.querySelector('input[name="previousGpa"]').value.trim();
  const previousCreditsInput = document.querySelector('input[name="previousCredits"]').value.trim();

  const previousGpa = previousGpaInput === '' ? 0 : Number(previousGpaInput);
  const previousCredits = previousCreditsInput === '' ? 0 : Number(previousCreditsInput);

  validatePreviousRecord(previousGpaInput === '' ? '' : previousGpa, previousCreditsInput === '' ? '' : previousCredits);

  return { previousGpa, previousCredits };
}

function showError(message) {
  const errorEl = document.getElementById('formError');
  errorEl.textContent = message;
  errorEl.hidden = false;
}

function clearError() {
  const errorEl = document.getElementById('formError');
  errorEl.hidden = true;
  errorEl.textContent = '';
}

function createCourseRow() {
  const row = document.createElement('div');
  row.className = 'grid-row course-row';
  row.innerHTML = `
    <label>
      Course
      <input name="course" type="text" placeholder="Course name">
    </label>
    <label>
      Credits
      <input name="credits" type="number" min="0" step="0.5" placeholder="3">
    </label>
    <label>
      Percentage
      <input name="percentage" type="number" min="0" max="100" step="1" placeholder="88">
    </label>
    <button class="remove-row-btn secondary-btn" type="button">Remove</button>
  `;
  return row;
}

function initializeCalculator() {
  const form = document.getElementById('calculatorForm');
  const addRowButton = document.getElementById('addRowButton');

  form.addEventListener('submit', event => {
    event.preventDefault();
    clearError();

    try {
      const rows = getCourseRows();
      const { previousGpa, previousCredits } = getPreviousRecord();
      const summary = calculateNewCGPA(previousGpa, previousCredits, rows);
      updateResultPanel({
        ...summary,
        previousGpa,
        previousCredits,
      });
    } catch (error) {
      showError(error.message || 'Invalid input.');
    }
  });

  addRowButton.addEventListener('click', () => {
    const form = document.getElementById('calculatorForm');
    const newRow = createCourseRow();
    form.insertBefore(newRow, document.getElementById('formError'));
    newRow.querySelector('input[name="course"]').focus();
  });

  form.addEventListener('click', event => {
    if (event.target.matches('.remove-row-btn')) {
      const row = event.target.closest('.course-row');
      if (!row) return;
      const rows = document.querySelectorAll('.course-row');
      if (rows.length === 1) {
        showError('At least one course row is required.');
        return;
      }
      row.remove();
    }
  });
}

initializeCalculator();
