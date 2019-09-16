"use strict";

const FIELDS_TABLE = [
  {
    name: 'picture',
    description: 'Picture',
  },
  {
    name: 'title',
    description: 'Title',
  },
  {
    name: 'firstname',
    description: 'First Name',
  },
  {
    name: 'lastname',
    description: 'Last Name',
  },
  {
    name: 'gender',
    description: 'Gender',
  },
  {
    name: 'email',
    description: 'Email',
  },
];

const FIELDS_DETAILS = [
  ...FIELDS_TABLE,
  {
    name: 'login',
    description: 'Login',
  },
  {
    name: 'password',
    description: 'Password',
  },
  {
    name: 'address',
    description: 'Address',
  },
];

class TestTakers {
  sortColumn = 'lastname';
  isDesc = false;
  limit = 10;
  currentPage = 1;
  testTalerNumber = null;

  async init(container) {
    this.container = container;

    const response = await fetch('https://api.myjson.com/bins/17hoe5');
    this.testTakers = await response.json();

    this.render();
  }

  render() {
    const { testTakers, sortColumn, isDesc, limit, currentPage, testTalerNumber } = this;

    this.container.innerHTML = this.markup({ testTakers, sortColumn, isDesc, limit, currentPage, testTalerNumber });

    this.testTakersColumns = this.container.querySelectorAll('.test-takers-columns div');
    this.testTakersData = this.container.querySelectorAll('.test-takers-data');
    this.testTakersSortBy = this.container.querySelector('.test-takers-sort-by select');
    this.testTakersPageButtons = this.container.querySelectorAll('.test-takers-page-button');
    this.testTakerPerPage = this.container.querySelector('.test-takers-per-page select');
    this.testTakersCloseButton = this.container.querySelector('.test-takers-close-button');
    this.testTakersDetailsContainer = this.container.querySelector('.test-takers-details-container');

    this.addEventListeners();
  }

  markup({ testTakers, sortColumn, isDesc, limit, currentPage, testTalerNumber }) {
    const testTakersSorted = this.sort(testTakers, sortColumn, isDesc);
    const testTakersPaginated = this.paginate(testTakersSorted, limit, currentPage);

    const testTakersMarkup = testTakersPaginated.reduce((acc, testTaker, index) => {
      return `${acc}${this.rowMarkup(testTaker, index)}`;
    }, '');

    return `
      <div class="test-takers-container">
        ${this.sortByMarkup(sortColumn, isDesc)}

        <div class="test-takers-table">
          ${this.headersMarkup(sortColumn, isDesc)}
          ${testTakersMarkup}

          <div class="test-takers-pagination">
            ${this.pagesMarkup(testTakers, limit, currentPage)}
            ${this.perPageMarkup(limit)}
          </div>

          ${testTalerNumber === null ? '' : `
            <div class="test-takers-details-container">
              ${this.detailsMarkup(testTakersPaginated[testTalerNumber])}
            </div>
          `}
        </div>

      </div>
    `;
  }

  sortByMarkup(sortColumn, isDesc) {
    const sortByMarkup = FIELDS_TABLE.reduce((acc, field) => `${acc}
      <option value="${field.name}"${sortColumn === field.name && !isDesc ? ' selected' : ''}>${field.description}</option>
      <option value="${field.name} DESC"${sortColumn === field.name && isDesc ? ' selected' : ''}>${field.description} DESC</option>
    `, '');

    return `
    <div class="test-takers-sort-by">
      <span>
        Sort by:
      </span>
      <select>
        ${sortByMarkup}
      </select>
    </div>
    `;
  }

  headersMarkup(sortColumn, isDesc) {
    const headersMarkup = FIELDS_TABLE.reduce((acc, field) => `${acc}
      <div class="test-takers-columns-${field.name}" data-column="${field.name}">
        ${field.description}${sortColumn === field.name ? isDesc ? ' ↓' : ' ↑' : ''}
      </div>
    `, '');

    return `
      <div class="test-takers-columns">
        ${headersMarkup}
      </div>
    `;
  }

  rowMarkup(testTaker, rowIndex) {
    const rowMarkup = FIELDS_TABLE.reduce((acc, field, index) => index ? `${acc}
      <div class="test-takers-columns-${field.name}">
        <span class="test-takers-description">${field.description}:&nbsp;</span>
        <span>${testTaker[field.name]}</span>
      </div>
    ` : '', '');

    return `
      <div data-index="${rowIndex}" class="test-takers-data">
        <div class="test-takers-columns-picture"><img src="${testTaker.picture}" /></div>
        ${rowMarkup}
      </div>
    `;
  }

  perPageMarkup(limit) {
    const pageOptions = [5, 10, 20, 50, 100];

    const perPageMarkup = pageOptions.reduce((acc, field) => `${acc}
      <option${limit === field ? ' selected' : ''}>${field}</option>
    `, '');

    return `
      <div class="test-takers-per-page">
        <select>
          ${perPageMarkup}
        </select>
      </div>
    `;
  }

  pagesMarkup(testTakers, limit, currentPage) {
    const pagesCount = Math.ceil(testTakers.length / limit);

    if (!pagesCount) {
      return '';
    }

    const pagesMarkup = new Array(pagesCount).fill('').map((_, index) =>
      `<button class="test-takers-page-button"${currentPage === index + 1 ? ' disabled' : ''}>${index + 1}</button>
    `);

    return `
      <div class="test-takers-pages">
        <span>Pages:</span>
        ${pagesMarkup.join('')}
      </div>
    `;
  }

  detailsMarkup(testTaker) {
    const detailsMarkup = FIELDS_DETAILS.reduce((acc, field, index) => index ? `${acc}
      <div>
        <span class="test-takers-description">${field.description}:&nbsp;</span>
        <span>${testTaker[field.name]}</span>
      </div>
    ` : '', '');

    return `
      <div class="test-takers-details">
        <div class="test-takers-details-picture"><img src="${testTaker.picture}" /></div>
        ${detailsMarkup}
        <div class="test-takers-details-close-button-container">
          <button class="test-takers-close-button">Close</button>
        </div>
      </div>
    `;
  }

  sort(testTakers, sortColumn, isDesc) {
    return [...testTakers].sort(((testTaker1, testTaker2) => {

      if (isDesc) {
        return testTaker2[sortColumn].localeCompare(testTaker1[sortColumn]);
      }

      return testTaker1[sortColumn].localeCompare(testTaker2[sortColumn]);
    }));
  }

  paginate(testTakersSorted, limit, currentPage) {
    return [...testTakersSorted].splice((currentPage - 1) * limit, limit);
  }

  addEventListeners() {
    this.testTakersColumns.forEach((testTakersColumn) => {
      testTakersColumn.addEventListener('click', (event) => {
        if (this.sortColumn !== event.target.dataset.column) {
          this.sortColumn = event.target.dataset.column;
          this.isDesc = false;
          this.currentPage = 1;
        } else {
          this.isDesc = !this.isDesc;
        }

        this.render();
      });
    });

    this.testTakersSortBy.addEventListener('change', (event) => {
      const [column, isNotDesc] = event.target.value.split(' ');

      this.sortColumn = column;
      this.isDesc = Boolean(isNotDesc);

      this.render();
    });

    this.testTakersPageButtons.forEach((testTakersColumn) => {
      testTakersColumn.addEventListener('click', (event) => {
        this.currentPage = Number(event.target.textContent);

        this.render();
      });
    });

    this.testTakerPerPage.addEventListener('change', (event) => {
      this.limit = Number(event.target.value);
      this.currentPage = 1;

      this.render();
    });

    if (this.testTakersCloseButton && this.testTakersDetailsContainer) {
      this.testTakersCloseButton.addEventListener('click', () => {
        this.testTalerNumber = null;

        this.render();
      });

      this.testTakersDetailsContainer.addEventListener('click', (event) => {
        if (!event.target.classList.contains('test-takers-details-container')) {
          return;
        }

        this.testTalerNumber = null;

        this.render();
      });
    }

    this.testTakersData.forEach((testTakersRow) => {
      testTakersRow.addEventListener('click', (event) => {
        this.testTalerNumber = Number(event.target.closest('.test-takers-data').dataset.index);

        this.render();
      });
    });
  }

  constructor(container) {
    this.init(container);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new TestTakers(document.getElementById('test-takers-list'))
});
