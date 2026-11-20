# Safety and use policy

OpenDiag talks to safety-critical vehicle systems. Writing to a module can brick it or make the car unsafe.

## Blocked by design (will not be implemented)

- Disabling or altering airbag / restraint / brake / steering behaviour.
- Bypassing immobilizers, key learning for theft, or defeating anti-theft.
- Odometer or mileage changes.
- Suppressing emissions-related faults or defeating emissions controls inside the ECU.
- Circumventing OEM authentication in a way that relies on leaked keys, algorithms or data.

## Required for any write

1. Full read-back backup of the module, hashed and stored.
2. Vehicle and module identity match.
3. Stable power: battery voltage check, charger recommended, ignition state verified.
4. Diff preview and explicit user consent.
5. Verify after write, automatic rollback on mismatch.

## Faults

"Ignoring" a fault means hiding it in OpenDiag's own display or muting alerts locally. It never means hiding it from the vehicle's own warnings.

Use at your own risk. Not legal or safety advice. Follow the laws where you live.
