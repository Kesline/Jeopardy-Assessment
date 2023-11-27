// categories is the main data structure for the app; it looks like this:
// [
//   { title: "Math",
//     clues: [
//       {question: "2+2", answer: 4, showing: null},
//       {question: "1+1", answer: 2, showing: null}
//       ...
//     ],
//   },
//   { title: "Literature",
//     clues: [
//       {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//       {question: "Bell Jar Author", answer: "Plath", showing: null},
//       ...
//     ],
//   },
//   ...
// ]

let categories = [];

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */
async function getCategoryIds() {
  const response = await axios.get("http://jservice.io/api/categories", { params: { count: 100 } });
  const categoryIds = _.sampleSize(response.data.map(category => category.id), 6);
  return categoryIds;
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */
async function getCategory(catId) {
  const response = await axios.get(`http://jservice.io/api/clues`, { params: { category: catId } });
  const clues = response.data.map(clue => ({ question: clue.question, answer: clue.answer, showing: null }));
  return { title: response.data[0].category.title, clues };
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initially, just show a "?" where the question/answer would go.)
 */
async function fillTable() {
  const $thead = $("thead");
  const $tbody = $("tbody");

  // Clear existing table content
  $thead.empty();
  $tbody.empty();

  // Fill header row with category names
  const $headerRow = $("<tr>");
  for (const category of categories) {
    $headerRow.append($("<td>").text(category.title));
  }
  $thead.append($headerRow);

  // Fill the table body with question cells
  for (let i = 0; i < 5; i++) {
    const $tr = $("<tr>");
    for (const category of categories) {
      const $td = $("<td>").text("?");
      $td.click(handleClick);
      $tr.append($td);
    }
    $tbody.append($tr);
  }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 */
function handleClick(evt) {
  const $td = $(evt.target);
  const row = $td.parent().index();
  const col = $td.index();
  const clue = categories[col].clues[row];

  if (clue.showing === null) {
    $td.text(clue.question);
    clue.showing = "question";
  } else if (clue.showing === "question") {
    $td.text(clue.answer);
    clue.showing = "answer";
  }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */
function showLoadingView() {
  $("#jeopardy").hide();
  $("#loading").show();
  $("#restart").prop("disabled", true);
}

/** Remove the loading spinner and update the button used to fetch data. */
function hideLoadingView() {
  $("#jeopardy").show();
  $("#loading").hide();
  $("#restart").prop("disabled", false);
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 */
async function setupAndStart() {
  showLoadingView();
  const categoryIds = await getCategoryIds();
  categories = await Promise.all(categoryIds.map(catId => getCategory(catId)));
  fillTable();
  hideLoadingView();
}

/** On click of start / restart button, set up game. */
$("#restart").on("click", setupAndStart);

/** On page load, add event handler for clicking clues */
$(setupAndStart);
