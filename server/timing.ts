import { ITimingStateVector } from 'timing-object'

// TimingObject from 'timing-object' depends on the dom.
export class Timing {
  #position = 0
  #velocity = 0
  #acceleration = 0
  #timestamp = 0

  // time of last query seconds
  #lasttime = Date.now() / 1_000

  sample() {
    const now = Date.now() / 1_000
    const elapsed = now - this.#lasttime
    this.#lasttime = now

    this.#position = this.#position
      + this.#velocity * elapsed
      + 0.5 * this.#acceleration * (elapsed ** 2)
    this.#velocity = this.#velocity + this.#acceleration * elapsed
    this.#timestamp = this.#timestamp + elapsed
    return this.vector()
  }

  update(update: Partial<ITimingStateVector>): ITimingStateVector {
    // sample vector for curent velocity and acceleration
    this.sample()

    if (update.position != null) this.#position = update.position
    if (update.velocity != null) this.#velocity = update.velocity
    if (update.acceleration != null) this.#acceleration = update.acceleration

    // timestamp can't be updated externally
    // if (update.timestamp) this.#timestamp = update.timestamp

    return this.vector()
  }

  vector(): ITimingStateVector {
    return {
      velocity: this.#velocity,
      position: this.#position,
      acceleration: this.#acceleration,
      timestamp: this.#timestamp,
    }
  }
}
