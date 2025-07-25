def run_finance_model(data):
    leverage = float(data['leverage'])
    qty = int(data['qty'])
    sgb_rate = float(data['sgb_rate'])
    margin_pct = float(data['margin_pct'])  # 0.9 means 90%
    cagr = float(data['cagr']) / 100        # convert % to decimal
    capital = 100

    margin_unlocked = qty * sgb_rate * margin_pct
    capital_exposed = margin_unlocked * leverage

    projections = {}
    for year in range(1, 6):
        future_value = capital_exposed * ((1 + cagr) ** year)
        growth = ((future_value - capital) / capital) * 100
        projections[f'year_{year}'] = {
            'value': round(future_value, 2),
            'growth_percent': round(growth, 2)
        }

    return {
        'margin_unlocked': round(margin_unlocked, 2),
        'capital_exposed': round(capital_exposed, 2),
        'projections': projections
    }
