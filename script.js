document.addEventListener("DOMContentLoaded", () => {

    


    /* 1. BASIC HELPERS */

    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);

    function escapeHTML(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }


    /* 2. CURRENT DATE */

    const currentDate = $("#currentDate");

    if (currentDate) {
        const today = new Date();

        currentDate.textContent = today.toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
            }
        );
    }


    /* 3. TIME-BASED GREETING*/

    const greeting = $("#greeting");

    function updateGreeting() {

        if (!greeting) return;

        const hour = new Date().getHours();

        let message;

        if (hour >= 5 && hour < 12) {
            message = "GOOD MORNING,";
        }
        else if (hour >= 12 && hour < 17) {
            message = "GOOD AFTERNOON,";
        }
        else {
            message = "GOOD EVENING,";
        }

        greeting.textContent = message;
    }

    updateGreeting();


    /* 4. STUDENT NAME*/

    const studentName = $("#studentName");

    if (studentName) {

        const savedName =
            localStorage.getItem("studyBuddyStudentName");

        if (savedName) {
            studentName.textContent = savedName;
        }

    }


    /* 5. THEME TOGGLE*/

    const themeToggle = $("#themeToggle");

    const savedTheme =
        localStorage.getItem("studyBuddyTheme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
    }


    if (themeToggle) {

        themeToggle.addEventListener("click", () => {

            document.body.classList.toggle("dark-mode");

            const darkMode =
                document.body.classList.contains("dark-mode");

            localStorage.setItem(
                "studyBuddyTheme",
                darkMode ? "dark" : "light"
            );

        });

    }


    /* 6. TASK SYSTEM*/

    let tasks =
        JSON.parse(
            localStorage.getItem("studyBuddyTasks")
        ) || [];


    const addTaskButton = $("#addTaskButton");
    const taskModal = $("#taskModal");
    const closeModal = $("#closeModal");
    const taskForm = $("#taskForm");

    const taskName = $("#taskName");
    const taskCourse = $("#taskCourse");
    const taskDate = $("#taskDate");

    const taskList = $("#taskList");

    const totalTasks = $("#totalTasks");
    const completedTasks = $("#completedTasks");

    const progressPercentage =
        $("#progressPercentage");

    const progressText =
        $("#progressText");


    function saveTasks() {

        localStorage.setItem(
            "studyBuddyTasks",
            JSON.stringify(tasks)
        );

    }


    function openTaskModal() {

        if (!taskModal) return;

        taskModal.classList.add("show");

    }


    function closeTaskModal() {

        if (!taskModal) return;

        taskModal.classList.remove("show");

    }


    if (addTaskButton) {

        addTaskButton.addEventListener(
            "click",
            openTaskModal
        );

    }


    if (closeModal) {

        closeModal.addEventListener(
            "click",
            closeTaskModal
        );

    }


    if (taskModal) {

        taskModal.addEventListener(
            "click",
            (event) => {

                if (event.target === taskModal) {
                    closeTaskModal();
                }

            }
        );

    }


    if (taskForm) {

        taskForm.addEventListener(
            "submit",
            (event) => {

                event.preventDefault();

                const name =
                    taskName.value.trim();

                const course =
                    taskCourse.value.trim();

                const date =
                    taskDate.value;


                if (!name || !course || !date) {

                    alert(
                        "Please complete all task fields."
                    );

                    return;

                }


                const newTask = {

                    id: Date.now(),

                    name: name,

                    course: course,

                    dueDate: date,

                    completed: false

                };


                tasks.push(newTask);

                saveTasks();

                renderTasks();

                taskForm.reset();

                closeTaskModal();

            }
        );

    }


    function renderTasks() {

        if (!taskList) return;

        const filter =
            $("#taskFilter")
                ? $("#taskFilter").value
                : "all";


        let filteredTasks = tasks;


        if (filter === "completed") {

            filteredTasks =
                tasks.filter(
                    task => task.completed
                );

        }


        if (filter === "pending") {

            filteredTasks =
                tasks.filter(
                    task => !task.completed
                );

        }


        taskList.innerHTML = "";


        if (filteredTasks.length === 0) {

            taskList.innerHTML = `

                <div class="empty-state">

                    <i class="fa-regular fa-clipboard"></i>

                    <p>
                        ${
                            tasks.length === 0
                                ? "No tasks yet."
                                : "No tasks match this filter."
                        }
                    </p>

                    <span>
                        ${
                            tasks.length === 0
                                ? "Add your first study task!"
                                : "Try another filter."
                        }
                    </span>

                </div>

            `;

            updateStatistics();

            return;

        }


        filteredTasks.forEach(task => {

            const taskElement =
                document.createElement("div");

            taskElement.className =
                "task-item";


            const date =
                new Date(
                    task.dueDate + "T00:00:00"
                );


            const formattedDate =
                date.toLocaleDateString(
                    "en-US",
                    {
                        month: "short",
                        day: "numeric"
                    }
                );


            taskElement.innerHTML = `

                <button
                    class="task-checkbox ${
                        task.completed
                            ? "completed"
                            : ""
                    }"
                    data-id="${task.id}"
                    aria-label="Complete task"
                >

                    ${
                        task.completed
                            ? '<i class="fa-solid fa-check"></i>'
                            : ""
                    }

                </button>


                <span
                    class="task-name ${
                        task.completed
                            ? "completed"
                            : ""
                    }"
                >
                    ${escapeHTML(task.name)}
                </span>


                <span class="task-course">

                    ${escapeHTML(task.course)}

                </span>


                <span class="task-date">

                    ${formattedDate}

                </span>


                <button
                    class="delete-task"
                    data-id="${task.id}"
                    aria-label="Delete task"
                >

                    <i class="fa-solid fa-trash"></i>

                </button>

            `;


            taskList.appendChild(taskElement);

        });


        updateStatistics();

    }


    if (taskList) {

        taskList.addEventListener(
            "click",
            (event) => {

                const checkbox =
                    event.target.closest(
                        ".task-checkbox"
                    );


                if (checkbox) {

                    const id =
                        Number(
                            checkbox.dataset.id
                        );


                    const task =
                        tasks.find(
                            task => task.id === id
                        );


                    if (task) {

                        task.completed =
                            !task.completed;

                        saveTasks();

                        renderTasks();

                    }

                    return;

                }


                const deleteButton =
                    event.target.closest(
                        ".delete-task"
                    );


                if (deleteButton) {

                    const id =
                        Number(
                            deleteButton.dataset.id
                        );


                    tasks =
                        tasks.filter(
                            task =>
                                task.id !== id
                        );


                    saveTasks();

                    renderTasks();

                }

            }
        );

    }


    const taskFilter =
        $("#taskFilter");


    if (taskFilter) {

        taskFilter.addEventListener(
            "change",
            renderTasks
        );

    }


    function updateStatistics() {

        const total =
            tasks.length;


        const completed =
            tasks.filter(
                task => task.completed
            ).length;


        const percentage =
            total === 0
                ? 0
                : Math.round(
                    (completed / total) * 100
                );


        if (totalTasks) {
            totalTasks.textContent = total;
        }


        if (completedTasks) {
            completedTasks.textContent =
                completed;
        }


        if (progressPercentage) {
            progressPercentage.textContent =
                `${percentage}%`;
        }


        if (progressText) {

            progressText.textContent =
                `${completed} of ${total} tasks completed`;

        }


        const progressCircle =
            $(".progress-circle");


        if (progressCircle) {

            progressCircle.style.background =
                `conic-gradient(
                    #e93696 ${percentage * 3.6}deg,
                    #eee9f2 ${percentage * 3.6}deg
                )`;

        }

    }


    renderTasks();


    /* 7. NOTES STORAGE*/

    let notes =
        JSON.parse(
            localStorage.getItem("studyBuddyNotes")
        ) || [];


    function saveNotes() {

        localStorage.setItem(
            "studyBuddyNotes",
            JSON.stringify(notes)
        );

    }


    /*  8. FEATURE MODAL*/

    function createFeatureModal() {

        let modal =
            $("#studyBuddyFeatureModal");


        if (modal) {
            return modal;
        }


        modal =
            document.createElement("div");


        modal.id =
            "studyBuddyFeatureModal";


        modal.innerHTML = `

            <div class="feature-modal-overlay">

                <div class="feature-modal">

                    <button
                        class="feature-close"
                        id="featureClose"
                    >

                        <i class="fa-solid fa-xmark"></i>

                    </button>


                    <div
                        id="featureContent"
                    ></div>

                </div>

            </div>

        `;


        document.body.appendChild(modal);


        modal
            .querySelector("#featureClose")
            .addEventListener(
                "click",
                closeFeatureModal
            );


        modal
            .querySelector(".feature-modal-overlay")
            .addEventListener(
                "click",
                (event) => {

                    if (
                        event.target.classList.contains(
                            "feature-modal-overlay"
                        )
                    ) {

                        closeFeatureModal();

                    }

                }
            );


        return modal;

    }


    function openFeatureModal(content) {

        const modal =
            createFeatureModal();


        modal.querySelector(
            "#featureContent"
        ).innerHTML = content;


        modal.classList.add("show");

    }


    function closeFeatureModal() {

        const modal =
            $("#studyBuddyFeatureModal");


        if (modal) {
            modal.classList.remove("show");
        }

    }


    /* 9. NOTES*/

    function openNotes() {

        const savedNotesHTML =
            notes.length === 0

                ? `

                    <div class="empty-feature">

                        <i class="fa-regular fa-file-lines"></i>

                        <h3>No notes yet</h3>

                        <p>
                            Create your first study note.
                        </p>

                    </div>

                `

                : notes.map(note => `

                    <div
                        class="saved-note"
                        data-note-id="${note.id}"
                    >

                        <h3>
                            ${escapeHTML(note.title)}
                        </h3>

                        <span class="note-course">

                            ${escapeHTML(note.course)}

                        </span>


                        <p>

                            ${escapeHTML(note.content)}

                        </p>


                        <div class="note-actions">

                            <button
                                class="generate-flashcards"
                                data-note-id="${note.id}"
                            >

                                <i class="fa-regular fa-clone"></i>

                                Flashcards

                            </button>


                            <button
                                class="generate-quiz"
                                data-note-id="${note.id}"
                            >

                                <i class="fa-solid fa-chart-simple"></i>

                                Quiz

                            </button>


                            <button
                                class="delete-note"
                                data-note-id="${note.id}"
                            >

                                <i class="fa-solid fa-trash"></i>

                            </button>

                        </div>

                    </div>

                `).join("");


        openFeatureModal(`

            <div class="feature-header">

                <i class="fa-regular fa-file-lines"></i>

                <h2>My Notes</h2>

                <p>
                    Write notes and use them to generate
                    flashcards and quizzes.
                </p>

            </div>


            <form id="noteForm">

                <input
                    type="text"
                    id="noteTitle"
                    placeholder="Note title"
                    required
                >


                <input
                    type="text"
                    id="noteCourse"
                    placeholder="Course"
                    required
                >


                <textarea
                    id="noteContent"
                    placeholder="Write your study notes here..."
                    rows="8"
                    required
                ></textarea>


                <button type="submit">

                    <i class="fa-solid fa-floppy-disk"></i>

                    Save Note

                </button>

            </form>


            <div class="saved-notes">

                ${savedNotesHTML}

            </div>

        `);


        const form =
            $("#noteForm");


        if (form) {

            form.addEventListener(
                "submit",
                event => {

                    event.preventDefault();


                    const title =
                        $("#noteTitle")
                            .value.trim();


                    const course =
                        $("#noteCourse")
                            .value.trim();


                    const content =
                        $("#noteContent")
                            .value.trim();


                    if (
                        !title ||
                        !course ||
                        !content
                    ) {

                        alert(
                            "Please complete all note fields."
                        );

                        return;

                    }


                    notes.push({

                        id: Date.now(),

                        title,

                        course,

                        content

                    });


                    saveNotes();

                    openNotes();

                }
            );

        }


        /* Delete notes */

        $$(".delete-note").forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            Number(
                                button.dataset.noteId
                            );


                        notes =
                            notes.filter(
                                note =>
                                    note.id !== id
                            );


                        saveNotes();

                        openNotes();

                    }
                );

            }
        );


        /* Generate flashcards */

        $$(".generate-flashcards").forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            Number(
                                button.dataset.noteId
                            );


                        const note =
                            notes.find(
                                note =>
                                    note.id === id
                            );


                        if (note) {
                            generateFlashcards(note);
                        }

                    }
                );

            }
        );


        /* Generate quiz */

        $$(".generate-quiz").forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            Number(
                                button.dataset.noteId
                            );


                        const note =
                            notes.find(
                                note =>
                                    note.id === id
                            );


                        if (note) {
                            generateQuiz(note);
                        }

                    }
                );

            }
        );

    }


    /* 10. NOTES → SENTENCES*/

    function extractSentences(text) {

        return text
            .replace(/\n+/g, " ")
            .split(/(?<=[.!?])\s+/)
            .map(sentence => sentence.trim())
            .filter(
                sentence =>
                    sentence.length >= 25
            );

    }


    /* 11. FLASHCARD GENERATOR*/

    function generateFlashcards(note) {

        const sentences =
            extractSentences(
                note.content
            );


        const cards = [];


        sentences.forEach(sentence => {

            const words =
                sentence.split(/\s+/);


            if (words.length < 7) {
                return;
            }


            const cleanedWords =
                words.map(
                    word =>
                        word.replace(
                            /[.,!?;:()[\]]/g,
                            ""
                        )
                );


            const candidates =
                cleanedWords.filter(
                    word =>
                        word.length >= 5
                );


            if (candidates.length === 0) {
                return;
            }


            const keyword =
                candidates.sort(
                    (a, b) =>
                        b.length - a.length
                )[0];


            const question =
                sentence.replace(
                    new RegExp(
                        keyword,
                        "i"
                    ),
                    "_____"
                );


            cards.push({

                question:
                    `Complete the statement: ${question}`,

                answer: keyword

            });

        });


        if (cards.length === 0) {

            alert(
                "Please add more detailed sentences to your notes so Study Buddy can create flashcards."
            );

            return;

        }


        showFlashcards(
            cards,
            note
        );

    }


    /* 12. FLASHCARD DISPLAY*/

    function showFlashcards(cards, note) {

        let current = 0;


        function displayCard() {

            const card =
                cards[current];


            openFeatureModal(`

                <div class="feature-header">

                    <i class="fa-regular fa-clone"></i>

                    <h2>Flashcards</h2>

                    <p>
                        ${escapeHTML(note.title)}
                    </p>

                </div>


                <div class="flashcard-counter">

                    Card ${current + 1}
                    of ${cards.length}

                </div>


                <div class="generated-flashcard">

                    <h3>
                        ${escapeHTML(
                            card.question
                        )}
                    </h3>


                    <div
                        id="flashcardAnswer"
                        class="flashcard-answer"
                        style="display:none;"
                    >

                        <strong>Answer:</strong>

                        ${escapeHTML(
                            card.answer
                        )}

                    </div>


                    <button id="showAnswer">

                        Show Answer

                    </button>

                </div>


                <div class="flashcard-navigation">

                    ${
                        current > 0
                            ? `
                                <button
                                    id="previousCard"
                                >
                                    <i class="fa-solid fa-arrow-left"></i>
                                    Previous
                                </button>
                            `
                            : ""
                    }


                    ${
                        current <
                        cards.length - 1

                            ? `
                                <button
                                    id="nextCard"
                                >
                                    Next
                                    <i class="fa-solid fa-arrow-right"></i>
                                </button>
                            `

                            : `
                                <button
                                    id="finishFlashcards"
                                >
                                    Finish
                                </button>
                            `
                    }

                </div>

            `);


            const showAnswer =
                $("#showAnswer");


            const answer =
                $("#flashcardAnswer");


            if (showAnswer) {

                showAnswer.addEventListener(
                    "click",
                    () => {

                        if (
                            answer.style.display ===
                            "none"
                        ) {

                            answer.style.display =
                                "block";

                            showAnswer.textContent =
                                "Hide Answer";

                        }
                        else {

                            answer.style.display =
                                "none";

                            showAnswer.textContent =
                                "Show Answer";

                        }

                    }
                );

            }


            const previous =
                $("#previousCard");


            if (previous) {

                previous.addEventListener(
                    "click",
                    () => {

                        current--;

                        displayCard();

                    }
                );

            }


            const next =
                $("#nextCard");


            if (next) {

                next.addEventListener(
                    "click",
                    () => {

                        current++;

                        displayCard();

                    }
                );

            }


            const finish =
                $("#finishFlashcards");


            if (finish) {

                finish.addEventListener(
                    "click",
                    openNotes
                );

            }

        }


        displayCard();

    }


    /* 13. QUIZ GENERATOR*/

    function generateQuiz(note) {

        const sentences =
            extractSentences(
                note.content
            );


        const questions = [];


        sentences.forEach(sentence => {

            const words =
                sentence.split(/\s+/);


            if (words.length < 7) {
                return;
            }


            const cleanedWords =
                words.map(
                    word =>
                        word.replace(
                            /[.,!?;:()[\]]/g,
                            ""
                        )
                );


            const candidates =
                cleanedWords.filter(
                    word =>
                        word.length >= 5
                );


            if (candidates.length < 2) {
                return;
            }


            const answer =
                candidates.sort(
                    (a, b) =>
                        b.length - a.length
                )[0];


            const question =
                sentence.replace(
                    new RegExp(
                        answer,
                        "i"
                    ),
                    "_____"
                );


            /* Create incorrect answers */

            const wrongAnswers =
                [
                    ...new Set(
                        cleanedWords.filter(
                            word =>
                                word.length >= 5 &&
                                word.toLowerCase() !==
                                answer.toLowerCase()
                        )
                    )
                ];


            const options = [
                answer,
                ...wrongAnswers.slice(0, 3)
            ];


            if (options.length < 2) {
                return;
            }


            /* Shuffle */

            for (
                let i = options.length - 1;
                i > 0;
                i--
            ) {

                const j =
                    Math.floor(
                        Math.random() *
                        (i + 1)
                    );


                [
                    options[i],
                    options[j]
                ] = [
                    options[j],
                    options[i]
                ];

            }


            questions.push({

                question:
                    `Complete the statement: ${question}`,

                options,

                answer:
                    options.indexOf(answer)

            });

        });


        if (questions.length === 0) {

            alert(
                "Please add more detailed notes so Study Buddy can generate a quiz."
            );

            return;

        }


        runQuiz(
            questions,
            note
        );

    }


    /* 14. QUIZ*/

    function runQuiz(questions, note) {

        let currentQuestion = 0;

        let score = 0;


        function displayQuestion() {

            const question =
                questions[currentQuestion];


            openFeatureModal(`

                <div class="feature-header">

                    <i class="fa-solid fa-chart-simple"></i>

                    <h2>Study Quiz</h2>

                    <p>
                        ${escapeHTML(note.title)}
                    </p>

                </div>


                <div class="quiz-progress">

                    Question
                    ${currentQuestion + 1}
                    of
                    ${questions.length}

                </div>


                <div class="quiz-question">

                    <h3>
                        ${escapeHTML(
                            question.question
                        )}
                    </h3>


                    <div class="quiz-options">

                        ${question.options
                            .map(
                                (option, index) => `

                                    <button
                                        class="quiz-option"
                                        data-answer="${index}"
                                    >

                                        <strong>
                                            ${String.fromCharCode(
                                                65 + index
                                            )}.
                                        </strong>

                                        ${escapeHTML(
                                            option
                                        )}

                                    </button>

                                `
                            )
                            .join("")}

                    </div>

                </div>

            `);


            $$(".quiz-option").forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const selected =
                                Number(
                                    button.dataset.answer
                                );


                            if (
                                selected ===
                                question.answer
                            ) {

                                score++;

                            }


                            currentQuestion++;


                            if (
                                currentQuestion <
                                questions.length
                            ) {

                                displayQuestion();

                            }
                            else {

                                showQuizResult();

                            }

                        }
                    );

                }
            );

        }


        function showQuizResult() {

            const percentage =
                Math.round(
                    (score /
                        questions.length) *
                    100
                );


            openFeatureModal(`

                <div class="quiz-result">

                    <i class="fa-solid fa-trophy"></i>

                    <h2>
                        Quiz Complete!
                    </h2>

                    <p>
                        You scored
                        <strong>
                            ${score}/${questions.length}
                        </strong>
                    </p>

                    <h3>
                        ${percentage}%
                    </h3>


                    <button id="retryQuiz">

                        <i class="fa-solid fa-rotate-right"></i>

                        Try Again

                    </button>

                </div>

            `);


            const retry =
                $("#retryQuiz");


            if (retry) {

                retry.addEventListener(
                    "click",
                    () => {

                        currentQuestion = 0;

                        score = 0;

                        displayQuestion();

                    }
                );

            }

        }


        displayQuestion();

    }


    /* 15. NOTES / FLASHCARD / QUIZ DASHBOARD CARDS*/

    const notesButton =
        $("#notesButton");

    const flashcardButton =
        $("#flashcardButton");

    const quizButton =
        $("#quizButton");


    if (notesButton) {

        notesButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                openNotes();

            }
        );

    }


    if (flashcardButton) {

        flashcardButton.addEventListener(
            "click",
            event => {

                event.preventDefault();


                if (notes.length === 0) {

                    alert(
                        "Create a note first. Your flashcards will be generated from your notes."
                    );

                    openNotes();

                    return;

                }


                /* Let the student choose a note */

                chooseNoteForFeature(
                    "flashcards"
                );

            }
        );

    }


    if (quizButton) {

        quizButton.addEventListener(
            "click",
            event => {

                event.preventDefault();


                if (notes.length === 0) {

                    alert(
                        "Create a note first. Your quiz will be generated from your notes."
                    );

                    openNotes();

                    return;

                }


                chooseNoteForFeature(
                    "quiz"
                );

            }
        );

    }


    /* 16. CHOOSE NOTE FOR FLASHCARD / QUIZ*/

    function chooseNoteForFeature(feature) {

        openFeatureModal(`

            <div class="feature-header">

                <i class="fa-regular fa-file-lines"></i>

                <h2>
                    Choose Your Notes
                </h2>

                <p>
                    Select the notes you want to study.
                </p>

            </div>


            <div class="note-selection">

                ${notes.map(note => `

                    <button
                        class="note-choice"
                        data-note-id="${note.id}"
                    >

                        <strong>
                            ${escapeHTML(
                                note.title
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                note.course
                            )}
                        </span>

                    </button>

                `).join("")}

            </div>

        `);


        $$(".note-choice").forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            Number(
                                button.dataset.noteId
                            );


                        const note =
                            notes.find(
                                note =>
                                    note.id === id
                            );


                        if (!note) return;


                        if (
                            feature ===
                            "flashcards"
                        ) {

                            generateFlashcards(
                                note
                            );

                        }
                        else {

                            generateQuiz(
                                note
                            );

                        }

                    }
                );

            }
        );

    }


    /* 17. SIDEBAR*/

    const sidebarItems =
        $$(".sidebar-nav .nav-item");


    sidebarItems.forEach(
        item => {

            item.addEventListener(
                "click",
                () => {

                    /* Remove active */

                    sidebarItems.forEach(
                        navItem => {

                            navItem.classList.remove(
                                "active"
                            );

                        }
                    );


                    item.classList.add("active");


                    const label =
                        item
                            .querySelector("span")
                            ?.textContent
                            .trim()
                            .toLowerCase();


                    if (label === "dashboard") {

                        window.scrollTo({
                            top: 0,
                            behavior: "smooth"
                        });

                    }


                    else if (
                        label === "tasks"
                    ) {

                        const taskSection =
                            $(".tasks-card");


                        if (taskSection) {

                            taskSection.scrollIntoView({
                                behavior: "smooth",
                                block: "center"
                            });

                        }

                    }


                    else if (
                        label === "notes"
                    ) {

                        openNotes();

                    }


                    else if (
                        label === "flashcards"
                    ) {

                        if (notes.length === 0) {

                            alert(
                                "Create a note first so Study Buddy can generate your flashcards."
                            );

                            openNotes();

                        }
                        else {

                            chooseNoteForFeature(
                                "flashcards"
                            );

                        }

                    }


                    else if (
                        label === "quiz"
                    ) {

                        if (notes.length === 0) {

                            alert(
                                "Create a note first so Study Buddy can generate your quiz."
                            );

                            openNotes();

                        }
                        else {

                            chooseNoteForFeature(
                                "quiz"
                            );

                        }

                    }


                    else if (
                        label === "study timer"
                    ) {

                        const timer =
                            $(".timer-card");


                        if (timer) {

                            timer.scrollIntoView({
                                behavior: "smooth",
                                block: "center"
                            });

                        }

                    }


                    else if (
                        label === "study tips"
                    ) {

                        const tips =
                            $(".tip-card");


                        if (tips) {

                            tips.scrollIntoView({
                                behavior: "smooth",
                                block: "center"
                            });

                        }

                    }

                }
            );

        }
    );


    /* 18. STUDY TIMER*/

    const timerDisplay =
        $("#timerDisplay");

    const startTimer =
        $("#startTimer");

    const resetTimer =
        $("#resetTimer");

    const timerMode =
        $("#timerMode");

    let timerInterval = null;

    let timerSeconds = 25 * 60;

    let timerRunning = false;


    function updateTimerDisplay() {

        if (!timerDisplay) return;


        const minutes =
            Math.floor(
                timerSeconds / 60
            );


        const seconds =
            timerSeconds % 60;


        timerDisplay.textContent =
            `${String(minutes).padStart(2, "0")}:${String(
                seconds
            ).padStart(2, "0")}`;

    }


    function resetTimerValue() {

        const minutes =
            Number(
                timerMode?.value || 25
            );


        timerSeconds =
            minutes * 60;


        updateTimerDisplay();

    }


    if (timerMode) {

        timerMode.addEventListener(
            "change",
            () => {

                clearInterval(
                    timerInterval
                );

                timerRunning = false;

                if (startTimer) {

                    startTimer.innerHTML = `
                        <i class="fa-solid fa-play"></i>
                        Start
                    `;

                }

                resetTimerValue();

            }
        );

    }


    if (startTimer) {

        startTimer.addEventListener(
            "click",
            () => {

                if (timerRunning) {

                    clearInterval(
                        timerInterval
                    );

                    timerRunning = false;


                    startTimer.innerHTML = `
                        <i class="fa-solid fa-play"></i>
                        Start
                    `;

                    return;

                }


                timerRunning = true;


                startTimer.innerHTML = `
                    <i class="fa-solid fa-pause"></i>
                    Pause
                `;


                timerInterval =
                    setInterval(
                        () => {

                            if (
                                timerSeconds > 0
                            ) {

                                timerSeconds--;

                                updateTimerDisplay();

                            }
                            else {

                                clearInterval(
                                    timerInterval
                                );

                                timerRunning = false;

                                startTimer.innerHTML = `
                                    <i class="fa-solid fa-play"></i>
                                    Start
                                `;

                                alert(
                                    "Study session complete! Great work!"
                                );

                            }

                        },
                        1000
                    );

            }
        );

    }


    if (resetTimer) {

        resetTimer.addEventListener(
            "click",
            () => {

                clearInterval(
                    timerInterval
                );

                timerRunning = false;

                resetTimerValue();


                if (startTimer) {

                    startTimer.innerHTML = `
                        <i class="fa-solid fa-play"></i>
                        Start
                    `;

                }

            }
        );

    }


    updateTimerDisplay();


    /* 19. STUDY TIPS*/

    const tips = [

        {
            text:
                "Try active recall instead of simply rereading your notes.",

            explanation:
                "It helps you remember information for longer."
        },

        {
            text:
                "Break large study sessions into smaller sessions.",

            explanation:
                "Short focused sessions can make studying easier to manage."
        },

        {
            text:
                "Explain a difficult concept in your own words.",

            explanation:
                "Teaching the idea helps you identify what you understand."
        },

        {
            text:
                "Test yourself before looking at your notes.",

            explanation:
                "Retrieving information strengthens your memory."
        },

        {
            text:
                "Take short breaks during long study sessions.",

            explanation:
                "A short break can help you return with better focus."
        }

    ];


    let currentTip = 0;


    const studyTip =
        $("#studyTip");

    const tipExplanation =
        $("#tipExplanation");

    const nextTip =
        $("#nextTip");


    function displayTip() {

        const tip =
            tips[currentTip];


        if (studyTip) {

            studyTip.textContent =
                `"${tip.text}"`;

        }


        if (tipExplanation) {

            tipExplanation.textContent =
                tip.explanation;

        }


        const dots =
            $$(".tip-dots span");


        dots.forEach(
            (dot, index) => {

                dot.classList.toggle(
                    "active",
                    index ===
                    currentTip % dots.length
                );

            }
        );

    }


    if (nextTip) {

        nextTip.addEventListener(
            "click",
            () => {

                currentTip =
                    (currentTip + 1) %
                    tips.length;


                displayTip();

            }
        );

    }


    /* 20. SEARCH*/

    const searchInput =
        $("#searchInput");


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            () => {

                const query =
                    searchInput.value
                        .trim()
                        .toLowerCase();


                if (!query) {

                    renderTasks();

                    return;

                }


                const matchingTasks =
                    tasks.filter(task =>
                        task.name
                            .toLowerCase()
                            .includes(query) ||

                        task.course
                            .toLowerCase()
                            .includes(query)
                    );


                if (!taskList) return;


                taskList.innerHTML = "";


                if (
                    matchingTasks.length === 0
                ) {

                    taskList.innerHTML = `

                        <div class="empty-state">

                            <i class="fa-solid fa-magnifying-glass"></i>

                            <p>
                                No results found
                            </p>

                        </div>

                    `;

                    return;

                }


                matchingTasks.forEach(
                    task => {

                        const element =
                            document.createElement(
                                "div"
                            );


                        element.className =
                            "task-item";


                        element.innerHTML = `

                            <button
                                class="task-checkbox ${
                                    task.completed
                                        ? "completed"
                                        : ""
                                }"
                                data-id="${task.id}"
                            >

                                ${
                                    task.completed
                                        ? '<i class="fa-solid fa-check"></i>'
                                        : ""
                                }

                            </button>


                            <span
                                class="task-name ${
                                    task.completed
                                        ? "completed"
                                        : ""
                                }"
                            >

                                ${escapeHTML(
                                    task.name
                                )}

                            </span>


                            <span class="task-course">

                                ${escapeHTML(
                                    task.course
                                )}

                            </span>


                            <span class="task-date">

                                ${task.dueDate}

                            </span>


                            <button
                                class="delete-task"
                                data-id="${task.id}"
                            >

                                <i class="fa-solid fa-trash"></i>

                            </button>

                        `;


                        taskList.appendChild(
                            element
                        );

                    }
                );

            }
        );

    }


    /* 21. ADD MODAL STYLES FOR NOTES / QUIZ / FLASHCARDS*/

    const featureStyle =
        document.createElement("style");


    featureStyle.textContent = `

        #studyBuddyFeatureModal {
            display: none;
            position: fixed;
            inset: 0;
            z-index: 99999;
        }


        #studyBuddyFeatureModal.show {
            display: block;
        }


        .feature-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(20, 15, 25, .65);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }


        .feature-modal {
            position: relative;
            width: min(720px, 95vw);
            max-height: 90vh;
            overflow-y: auto;
            background: #ffffff;
            color: #242124;
            border-radius: 24px;
            padding: 35px;
            box-sizing: border-box;
            box-shadow: 0 25px 80px rgba(0,0,0,.3);
        }


        .feature-close {
            position: absolute;
            top: 15px;
            right: 18px;
            border: none;
            background: none;
            font-size: 24px;
            cursor: pointer;
            color: #777;
        }


        .feature-header {
            text-align: center;
            margin-bottom: 25px;
        }


        .feature-header > i {
            font-size: 35px;
            color: #e93696;
            margin-bottom: 10px;
        }


        .feature-header h2 {
            margin: 5px 0;
        }


        .feature-header p {
            color: #777;
        }


        #noteForm {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 25px;
        }


        #noteForm input,
        #noteForm textarea {
            width: 100%;
            box-sizing: border-box;
            padding: 14px;
            border: 1px solid #ddd;
            border-radius: 12px;
            font-family: inherit;
        }


        #noteForm textarea {
            resize: vertical;
        }


        #noteForm button,
        .generate-flashcards,
        .generate-quiz,
        #showAnswer,
        #previousCard,
        #nextCard,
        #finishFlashcards,
        #retryQuiz {
            border: none;
            border-radius: 10px;
            padding: 11px 16px;
            background: #7138c9;
            color: white;
            cursor: pointer;
            font-weight: 600;
        }


        .saved-note {
            background: #f8f4fc;
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 15px;
        }


        .saved-note h3 {
            margin: 0 0 5px;
        }


        .saved-note .note-course {
            color: #8b4cc7;
            font-size: 13px;
            font-weight: 600;
        }


        .saved-note p {
            line-height: 1.6;
            white-space: pre-wrap;
        }


        .note-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 15px;
        }


        .delete-note {
            border: none;
            background: #ffe8ef;
            color: #d62465;
            border-radius: 10px;
            padding: 10px 13px;
            cursor: pointer;
        }


        .flashcard-counter,
        .quiz-progress {
            text-align: center;
            color: #777;
            margin-bottom: 20px;
        }


        .generated-flashcard {
            background: #f7f0ff;
            padding: 40px 25px;
            border-radius: 20px;
            text-align: center;
        }


        .generated-flashcard h3 {
            line-height: 1.6;
        }


        .flashcard-answer {
            background: #ffffff;
            padding: 18px;
            border-radius: 12px;
            margin: 20px 0;
            line-height: 1.6;
        }


        .flashcard-navigation {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 20px;
        }


        .quiz-options {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-top: 20px;
        }


        .quiz-option {
            border: 1px solid #ddd;
            background: #fff;
            padding: 15px;
            border-radius: 12px;
            cursor: pointer;
            text-align: left;
            font-size: 15px;
        }


        .quiz-option:hover {
            border-color: #e93696;
            background: #fff5fa;
        }


        .quiz-result {
            text-align: center;
            padding: 25px;
        }


        .quiz-result > i {
            font-size: 55px;
            color: #e93696;
        }


        .quiz-result h3 {
            font-size: 45px;
            color: #7138c9;
        }


        .note-selection {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }


        .note-choice {
            text-align: left;
            border: 1px solid #ddd;
            background: #faf8fc;
            padding: 18px;
            border-radius: 14px;
            cursor: pointer;
        }


        .note-choice:hover {
            border-color: #e93696;
            transform: translateY(-2px);
        }


        .note-choice strong {
            display: block;
            margin-bottom: 5px;
        }


        .note-choice span {
            color: #777;
            font-size: 13px;
        }


        .dark-mode .feature-modal {
            background: #211c29;
            color: #f7f3fa;
        }


        .dark-mode #noteForm input,
        .dark-mode #noteForm textarea,
        .dark-mode .quiz-option {
            background: #2d2637;
            color: #fff;
            border-color: #51475d;
        }


        .dark-mode .saved-note,
        .dark-mode .generated-flashcard,
        .dark-mode .note-choice {
            background: #30283b;
            color: #fff;
            border-color: #51475d;
        }


        .dark-mode .flashcard-answer {
            background: #211c29;
            color: #fff;
        }

    `;


    document.head.appendChild(featureStyle);


    /*  22. FINISH*/

    displayTip();

    console.log(
        "Study Buddy is ready."
    );

});