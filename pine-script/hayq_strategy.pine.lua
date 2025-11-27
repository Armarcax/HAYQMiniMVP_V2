//@version=5
strategy("HAYQ Modular Strategy", overlay=true, default_qty_type=strategy.percent_of_equity, default_qty_value=10)

// ========================
// PARAMETERS
// ========================
useAlerts = input.bool(true, "Enable Alerts")

// ========================
// IMPORT SIGNALS
// ========================
// Note: TradingView doesn't have dynamic imports; signals are included manually
// Մոդուլային դիզայն՝ յուրաքանչյուր signal-ի code block առանձին
// import signals/ema_cross.pine
fastLength = input.int(12, "Fast EMA Length")
slowLength = input.int(26, "Slow EMA Length")
fastEMA = ta.ema(close, fastLength)
slowEMA = ta.ema(close, slowLength)
emaLong  = ta.crossover(fastEMA, slowEMA)
emaShort = ta.crossunder(fastEMA, slowEMA)

// import signals/rsi_levels.pine
rsiLength  = input.int(14, "RSI Length")
rsiOverbought = input.int(70, "RSI Overbought")
rsiOversold   = input.int(30, "RSI Oversold")
rsiVal = ta.rsi(close, rsiLength)
rsiLong  = rsiVal < rsiOverbought
rsiShort = rsiVal > rsiOversold

// ========================
// COMBINED SIGNALS
// ========================
longSignal  = emaLong and rsiLong
shortSignal = emaShort and rsiShort

// ========================
// PLOTTING
// ========================
plot(fastEMA, color=color.blue, title="Fast EMA")
plot(slowEMA, color=color.orange, title="Slow EMA")
bgcolor(longSignal ? color.new(color.green, 85) : shortSignal ? color.new(color.red, 85) : na)

// ========================
// STRATEGY EXECUTION
// ========================
if longSignal
    strategy.entry("Long", strategy.long)
if shortSignal
    strategy.entry("Short", strategy.short)

// ========================
// ALERTS
// ========================
if useAlerts
    if longSignal
        alert("HAYQ Strategy: LONG Signal ✅", alert.freq_once_per_bar_close)
    if shortSignal
        alert("HAYQ Strategy: SHORT Signal ❌", alert.freq_once_per_bar_close)
