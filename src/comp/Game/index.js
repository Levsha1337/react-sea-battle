import React, { Component } from 'react';
import SeaBattle from './sea-battle';
import './index.scss';

import SpriteMiss from '../../res/sprite_miss.png';
import SpriteCell from '../../res/sprite_cell.png';
import SpriteHit from '../../res/sprite_hit.png';
import SpriteKill from '../../res/sprite_kill.png';
import SpriteAuto from '../../res/sprite_auto.png';

const styles = [
    { backgroundImage: `url(${SpriteCell})` },
    { backgroundImage: `url(${SpriteMiss})` },
    { backgroundImage: `url(${SpriteHit })` },
    { backgroundImage: `url(${SpriteKill})` },
    { backgroundImage: `url(${SpriteAuto})` }
];

export default class Game extends Component {
    constructor(props) {
        super(props);

        this.seaBattle = new SeaBattle();

        this.state = {
            gameField: [...Array(10)].map(() => Array(10).fill(-1)),
            shots: 0,
            shipsLeft: 0
        };
    }

    componentDidMount() {
        this.restart();
    }

    restart() {
        this.seaBattle.restart();
        this.setState({
            gameField: [...Array(10)].map(() => Array(10).fill(-1)),
            shots: 0,
            shipsLeft: 10
        });
    }
    
    cellClicked(eventX, eventY) {
        // there we have already opened cell
        if (this.state.gameField[eventY][eventX] !== -1) return;
        
        let left = this.state.shipsLeft;
        
        // if we have zero ships alive user cant open more cells
        if (left === 0) return;

        // unlink array elements from state
        let newField = [...this.state.gameField];
        newField[eventY] = [...newField[eventY]];

        const shot = this.seaBattle.openCell(eventX, eventY);

        if (shot.result === 2) { // if we killed the ship
            // unlink more array elements from state
            newField = newField.map(row => [...row]);
            const decks = shot.ship.decks;

            // we marks all decks as killed instead of hitted
            decks.forEach(deck => {
                newField[deck.y][deck.x] = shot.result;
            });
            left--;
            
            // generate area bounds with no ships near the killed one
            const fromTo = SeaBattle.getFromTo(
                shot.ship.pos.x,
                shot.ship.pos.y,
                shot.ship.decks.length,
                shot.ship.pos.isVertical
            );

            // filling ships-free area
            for (let y = fromTo.fromY; y <= fromTo.toY; y++) {
                for (let x = fromTo.fromX; x <= fromTo.toX; x++) {
                    if (newField[y][x] === -1) newField[y][x] = 3;
                }
            }
        } else { // else we have hit or miss
            newField[eventY][eventX] = shot.result;
        }
        
        this.setState({
            gameField: newField,
            shots: this.state.shots + 1,
            shipsLeft: left
        });
    }

    render() {
        const isWin = this.state.shipsLeft === 0;
        return ( <div id='game'>
            <div id='texts'>
                <div>
                    {isWin ? 'You WIN!' : `Ships left: ${this.state.shipsLeft}`}
                </div>
                <div>
                    Shots: {this.state.shots}
                </div>
                <button onClick={() => this.restart()}>Restart</button>
            </div>
            {
                this.state.gameField.map((row, y) => <div key={y} className='row'>{
                    row.map((cell, x) =>
                        <div onClick={() => this.cellClicked(x, y)}
                            key={x}
                            style={styles[cell+1]}
                            className='cell'>
                            {/* {cell.ship} */}
                        </div>
                    )
                }</div>)
            }
        </div>
        );
    }
}