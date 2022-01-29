import { ITimingStateVector } from 'timing-object'

// TimingObject from 'timing-object' depends on the dom.
export class Timing {
  #velocity = 0
  #position = 0
  #timestamp = 0
  // #acceleration TODO

  // time of last query seconds
  #lasttime = Date.now() / 1_000

  query(): ITimingStateVector {
    const now = Date.now() / 1_000
    const elapsed = now - this.#lasttime
    this.#lasttime = now

    this.#position = this.#position + this.#velocity * elapsed
    this.#timestamp = this.#timestamp + elapsed
    return {
      velocity: this.#velocity,
      position: this.#position,
      acceleration: 0,
      timestamp: this.#timestamp,
    }
  }

  play(): ITimingStateVector {
    const vector = this.query()
    this.#velocity = 1
    return vector
  }

  pause(): ITimingStateVector {
    const vector = this.query()
    this.#velocity = 0
    return vector
  }

}
