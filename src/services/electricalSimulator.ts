/**
 * Dedicated Electrical Simulation Service
 * STRICT REQUIREMENT: Only Voltage and Current may be simulated.
 * Clearly labeled and isolated from real hardware sensor providers.
 */

export class ElectricalSimulator {
  private nominalVoltage: number = 48.0; // 48V Nominal EV Pack (13S Li-ion or 16S LiFePO4)
  private minVoltage: number = 42.0;
  private maxVoltage: number = 52.4;

  private minCurrent: number = 0.5;   // Standby draw in Amps
  private maxCurrent: number = 28.5;  // Peak acceleration draw in Amps

  private currentVoltage: number = 49.2;
  private currentAmps: number = 2.4;

  /**
   * Generates realistic simulated electrical values correlated with motor activity
   * @param isMotorRotating Whether real RPM sensor detects shaft rotation
   * @param currentRpm Actual RPM if available
   */
  public tick(isMotorRotating: boolean, currentRpm: number | null): {
    voltage_v: number;
    current_a: number;
    power_w: number;
    isSimulated: true;
  } {
    // Dynamic current based on RPM load
    if (!isMotorRotating || currentRpm === null || currentRpm < 50) {
      // Idle / Standby draw
      this.currentAmps = 0.8 + (Math.random() - 0.5) * 0.2;
    } else {
      // Cruising / accelerating load between 4A and 25A
      const loadRatio = Math.min(1.0, currentRpm / 3000.0);
      const targetAmps = 3.0 + loadRatio * 18.0 + (Math.random() - 0.5) * 1.5;
      this.currentAmps = Math.max(this.minCurrent, Math.min(this.maxCurrent, targetAmps));
    }

    // Battery pack voltage sag under simulated load
    const voltageSag = (this.currentAmps / this.maxCurrent) * 2.8;
    const noise = (Math.random() - 0.5) * 0.15;
    this.currentVoltage = parseFloat(
      Math.max(this.minVoltage, Math.min(this.maxVoltage, 50.4 - voltageSag + noise)).toFixed(2)
    );

    const roundedAmps = parseFloat(this.currentAmps.toFixed(2));
    const calculatedPower = parseFloat((this.currentVoltage * roundedAmps).toFixed(1));

    return {
      voltage_v: this.currentVoltage,
      current_a: roundedAmps,
      power_w: calculatedPower,
      isSimulated: true,
    };
  }
}

export const electricalSimulator = new ElectricalSimulator();
