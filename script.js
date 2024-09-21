// @ts-check

class GameData {
	/** * @type {Array<number | null>} */
	panel = Array(9);

	/** * @type {number} */
	turn;

	/** * @type {boolean} */
	finished;

	constructor() {
		this.restart();
	}

	restart = () => {
		this.panel.fill(null);
		this.turn = 0;
		this.finished = false;
	};

	/**
	 * @param {number} position
	 */
	loop = (position) => {
		this.panel[position] = this.turn;

		const winConditions = [
			[0, 1, 2], // Top row
			[3, 4, 5], // Middle row
			[6, 7, 8], // Bottom row
			[0, 3, 6], // Left column
			[1, 4, 7], // Middle column
			[2, 5, 8], // Right column
			[0, 4, 8], // Diagonal from top-left to bottom-right
			[2, 4, 6], // Diagonal from top-right to bottom-left
		];

		for (const condition of winConditions) {
			const [a, b, c] = condition;
			if (
				this.panel[a] === this.turn &&
				this.panel[b] === this.turn &&
				this.panel[c] === this.turn
			) {
				this.finished = true;
			}
		}

		if (!this.finished && !this.isDraw) {
			this.nextTurn();
		}
	};

	nextTurn = () => {
		this.turn = (this.turn + 1) % players.length;
	};

	get isDraw() {
		return !this.panel.includes(null);
	}
}

const players = [
	{ class: "cross", name: "Cross" },
	{ class: "circle", name: "Circle" },
];

/**
 * @param {KeyboardEvent} event
 * @param {number} index
 */
function getNewPosition(event, index) {
	const code = event.code;

	switch (code) {
		case "ArrowUp":
		case "KeyW":
		case "KeyI":
			return index - 3;
		case "ArrowRight":
		case "KeyD":
		case "KeyL":
			return index + 1;
		case "ArrowDown":
		case "KeyS":
		case "KeyK":
			return index + 3;
		case "ArrowLeft":
		case "KeyA":
		case "KeyJ":
			return index - 1;
		default:
			return index;
	}
}

/**
 * @template {HTMLElement} T
 * @param {string} selector
 * @param {new () => T} type
 * @returns {T}
 */
function $(selector, type) {
	const el = document.querySelector(selector);

	if (!el) throw new Error(`Invalid selector: ${selector}`);
	if (!(el instanceof type)) {
		throw new Error(
			`Invalid type for ${selector}: ${type.name}. ` +
				`Got ${el.constructor.name}`,
		);
	}

	return el;
}

function main() {
	const $main = $("main", HTMLElement);
	const $dialog = $("dialog", HTMLDialogElement);
	const $currentPlayer = $("#currentPlayer", HTMLSpanElement);
	const $dialogText = $("#dialogText", HTMLParagraphElement);
	const $restartButton = $("#restartButton", HTMLButtonElement);

	const $boxes = Array(9);

	for (let i = 0; i < $boxes.length; i++) {
		const $box = document.createElement("div");
		$box.classList.add("box");
		$box.dataset.index = i.toString();
		$box.tabIndex = 0;

		$boxes[i] = $box;
	}

	$main.append(...$boxes);

	/**
	 * @param {string} text
	 */
	const showDialog = (text) => {
		$dialogText.textContent = text;
		$dialog.showModal();
	};

	const updatePanel = () => {
		for (let i = 0; i < $boxes.length; i++) {
			const $box = $boxes[i];
			const value = gameData.panel[i];

			for (let i = 0; i < players.length; i++) {
				$box.classList.toggle(players[i].class, value === i);
			}

			$box.classList.toggle("active", value !== null);
		}

		for (let i = 0; i < players.length; i++) {
			document.body.classList.toggle(players[i].class, i === gameData.turn);
		}

		const currentPlayer = players[gameData.turn];
		$currentPlayer.textContent = currentPlayer.name;
	};

	const restart = () => {
		$dialog.close();
		$dialogText.textContent = "";
		gameData.restart();
		updatePanel();
	};

	/**
	 * @param {Event} event
	 */
	const selectBox = (event) => {
		const $box = event.target;

		if (!($box instanceof HTMLDivElement)) return;
		if ($box.classList.contains("active")) return;

		const index = $box.dataset.index;
		if (!index) throw new Error("Invalid index");

		const position = Number.parseInt(index);
		gameData.loop(position);
		updatePanel();

		if (gameData.finished) {
			showDialog(`Player ${players[gameData.turn].name} wins!`);
		} else if (gameData.isDraw) {
			showDialog("It's a draw!");
		}
	};

	/**
	 * @param {KeyboardEvent} event
	 */
	const moveFocus = (event) => {
		if (event.code === "Tab") return;
		if (["Enter", "Space"].includes(event.code)) {
			selectBox(event);
		}

		const $activeBox = document.activeElement;
		if (!($activeBox instanceof HTMLDivElement)) {
			const $firstBox = $boxes[0];
			$firstBox.focus();
			return;
		}

		const index = $activeBox.dataset.index;
		if (!index) throw new Error("Invalid index");

		const position = getNewPosition(event, Number.parseInt(index));

		const $box = $boxes[position];
		if ($box) $box.focus();
	};

	const gameData = new GameData();
	updatePanel();

	$main.addEventListener("click", selectBox);
	document.addEventListener("keydown", moveFocus);
	$restartButton.addEventListener("click", restart);
}

main();
