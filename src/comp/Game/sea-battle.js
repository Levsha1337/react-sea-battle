const SHIPS = [
    {
        decks: 4,
        count: 1
    }
    ,
    {
        decks: 3,
        count: 2
    },
    {
        decks: 2,
        count: 3
    },
    {
        decks: 1,
        count: 4
    }
];

class Cell {
    constructor(opened, ship) {
        this.opened = opened;
        this.ship = ship;
    }
}

export default class SeaBattle {
    constructor() {
        this.ships = [];
        this.gameField = [];
    }

    random(n) {
        return Math.floor(Math.random() * (n + 1));
    }

    // TODO
    openCell(x, y) {
        const cell = this.gameField[y][x];
        cell.opened = true;

        const id = cell.ship;
        if (id !== 0) {
            const ship = this.ships[id - 1];

            return {
                shipsAlive: this.ships.filter(ship => ship.decksAlive > 0).length,
                result: --ship.decksAlive === 0 ? 2 : 1,
                ship
            };
        }

        return {
            shipsAlive: this.ships.filter(ship => ship.decksAlive > 0).length,
            result: 0
        };
    }

    restart() {
        this.clearGameField();

        SHIPS.map(shipType => {
            for (let i = 0; i < shipType.count; i++) {
                const pos = this.generatePosition(shipType.decks);
                this.setShip(pos, shipType);
            }
        });
    }

    clearGameField() {
        this.ships = [];
        this.gameField = [...Array(10)].map(() => Array(10).fill(new Cell(false, 0)));
    }

    generatePosition(decks) {
        while (true) {
            const isVertical = Boolean(this.random(1));
            
            let x, y;
            if (isVertical) {
                x = this.random(9);
                y = this.random(10 - decks);
            } else {
                x = this.random(10 - decks);
                y = this.random(9);
            }

            if (!this.validatePosition(x, y, decks, isVertical)) continue;
            
            return ({x, y, isVertical});
        }
    }

    static getFromTo(x, y, decks, isVertical) {
        // we starts from x - 1 & y - 1
        // using Math.max() to prevent getting out of bound
        const fromX = Math.max(0, x - 1);
        const fromY = Math.max(0, y - 1);

        // and checking for x + 1 & y + 1
        let toX, toY;
        if (isVertical) {
            toX = Math.min(9, x + 1);
            toY = Math.min(9, y + decks);
        } else {
            toX = Math.min(9, x + decks);
            toY = Math.min(9, y + 1);
        }

        return {
            fromX, fromY, toX, toY
        };
    }

    validatePosition(x, y, decks, isVertical) {
        const { fromX, fromY, toX, toY } = SeaBattle.getFromTo(x, y, decks, isVertical);

        if (this.gameField.slice(fromY, toY + 1)
            .filter(arr =>
                arr.slice(fromX, toX + 1).filter(cell => cell.ship > 0).length > 0
            ).length > 0) return false;

        return true;
    } 

    setShip(pos, shipType) {
        const id = this.ships.length + 1;
        const ship = {
            id,
            decks: [],
            decksAlive: shipType.decks,
            pos
        };

        for (let i = 0; i < shipType.decks; i++) {
            const x = pos.isVertical ? pos.x : pos.x + i;
            const y = pos.isVertical ? pos.y + i : pos.y;
            this.gameField[y][x] = new Cell(false, id);
            ship.decks.push({x, y});
        }

        this.ships.push(ship);
    }
}