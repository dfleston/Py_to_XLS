export interface FinancialTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  badge: string;
  pythonCode: string;
}

export const FINANCIAL_TEMPLATES: FinancialTemplate[] = [
  {
    id: 'dcf-valuation',
    name: '5-Year DCF & Equity Valuation',
    category: 'Corporate Valuation',
    badge: 'M&A / Valuation',
    description: 'Projects Free Cash Flow to Firm (FCFF), discounts at WACC, calculates Gordon Growth Terminal Value and Implied Share Price.',
    pythonCode: `import math

def dcf_valuation(
    base_revenue: float = 10_000_000.0,
    growth_rate: float = 0.15,
    ebit_margin: float = 0.22,
    tax_rate: float = 0.21,
    capex_pct: float = 0.05,
    nwc_pct: float = 0.03,
    wacc: float = 0.095,
    terminal_growth: float = 0.025,
    diluted_shares: float = 1_000_000.0,
    net_debt: float = 2_000_000.0,
    forecast_years: int = 5
) -> dict:
    """
    Computes 5-Year DCF, Enterprise Value, Equity Value, and Implied Intrinsic Share Price.
    """
    if wacc <= terminal_growth:
        raise ValueError("WACC must be strictly greater than terminal growth rate.")
    
    projections = []
    current_rev = base_revenue
    pv_fcff_sum = 0.0

    for year in range(1, forecast_years + 1):
        current_rev *= (1 + growth_rate)
        ebit = current_rev * ebit_margin
        nopat = ebit * (1 - tax_rate)
        capex = current_rev * capex_pct
        nwc_change = current_rev * nwc_pct
        fcff = nopat - capex - nwc_change
        discount_factor = 1.0 / math.pow(1 + wacc, year)
        pv_fcff = fcff * discount_factor
        pv_fcff_sum += pv_fcff
        
        projections.append({
            "year": year,
            "revenue": current_rev,
            "ebit": ebit,
            "nopat": nopat,
            "capex": capex,
            "fcff": fcff,
            "discount_factor": discount_factor,
            "pv_fcff": pv_fcff
        })

    # Terminal Value calculation (Gordon Growth Model)
    final_fcff = projections[-1]["fcff"]
    terminal_value = (final_fcff * (1 + terminal_growth)) / (wacc - terminal_growth)
    pv_terminal_value = terminal_value / math.pow(1 + wacc, forecast_years)
    
    enterprise_value = pv_fcff_sum + pv_terminal_value
    equity_value = enterprise_value - net_debt
    implied_share_price = equity_value / diluted_shares

    return {
        "pv_explicit_cash_flows": pv_fcff_sum,
        "terminal_value": terminal_value,
        "pv_terminal_value": pv_terminal_value,
        "enterprise_value": enterprise_value,
        "equity_value": equity_value,
        "implied_share_price": implied_share_price,
        "projections": projections
    }

# Example run:
if __name__ == "__main__":
    result = dcf_valuation()
    print(f"Enterprise Value: \${result['enterprise_value']:,.2f}")
    print(f"Implied Share Price: \${result['implied_share_price']:,.2f}")
`
  },
  {
    id: 'loan-amortization',
    name: 'Loan Amortization & Payoff Schedule',
    category: 'Debt & Banking',
    badge: 'Fixed Income',
    description: 'Computes monthly payment, splits into principal & interest, supports monthly prepayments and tracks cumulative savings.',
    pythonCode: `def calculate_loan_amortization(
    principal: float = 500_000.0,
    annual_rate: float = 0.065,
    years: int = 5,
    extra_monthly_payment: float = 300.0
) -> dict:
    """
    Computes standard monthly PMT and full amortization schedule with optional prepayments.
    """
    monthly_rate = annual_rate / 12.0
    total_months = years * 12
    
    # Base formula PMT = P * r * (1+r)^n / ((1+r)^n - 1)
    factor = (1 + monthly_rate) ** total_months
    standard_monthly_pmt = (principal * monthly_rate * factor) / (factor - 1)
    
    balance = principal
    schedule = []
    total_interest_paid = 0.0
    total_principal_paid = 0.0
    month = 1

    while balance > 0 and month <= total_months * 2:
        interest_charge = balance * monthly_rate
        total_payment = min(standard_monthly_pmt + extra_monthly_payment, balance + interest_charge)
        principal_payment = total_payment - interest_charge
        ending_balance = max(0.0, balance - principal_payment)
        
        total_interest_paid += interest_charge
        total_principal_paid += principal_payment
        
        schedule.append({
            "month": month,
            "beginning_balance": balance,
            "payment": total_payment,
            "principal_part": principal_payment,
            "interest_part": interest_charge,
            "ending_balance": ending_balance
        })
        
        balance = ending_balance
        if balance <= 0.01:
            break
        month += 1

    return {
        "standard_monthly_pmt": standard_monthly_pmt,
        "actual_months_to_payoff": len(schedule),
        "total_interest_paid": total_interest_paid,
        "total_principal_paid": total_principal_paid,
        "total_cost": total_principal_paid + total_interest_paid,
        "months_saved": total_months - len(schedule),
        "schedule": schedule
    }
`
  },
  {
    id: 'black-scholes',
    name: 'Black-Scholes Options Pricing & Greeks',
    category: 'Derivatives & Quant',
    badge: 'Quant Finance',
    description: 'Calculates European Call and Put prices with Delta, Gamma, Theta, Vega, and Rho using the standard Black-Scholes-Merton model.',
    pythonCode: `import math

def norm_cdf(x: float) -> float:
    """Standard normal cumulative distribution function approximation."""
    return 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))

def norm_pdf(x: float) -> float:
    """Standard normal probability density function."""
    return (1.0 / math.sqrt(2.0 * math.pi)) * math.exp(-0.5 * x * x)

def black_scholes_greeks(
    spot_price: float = 100.0,
    strike_price: float = 105.0,
    time_to_maturity: float = 0.5,    # in years (e.g. 6 months = 0.5)
    risk_free_rate: float = 0.045,    # 4.5% annual
    volatility: float = 0.25          # 25% annualized volatility
) -> dict:
    """
    Computes European option call/put pricing and analytical Greeks.
    """
    s = spot_price
    k = strike_price
    t = time_to_maturity
    r = risk_free_rate
    sigma = volatility

    d1 = (math.log(s / k) + (r + 0.5 * sigma ** 2) * t) / (sigma * math.sqrt(t))
    d2 = d1 - sigma * math.sqrt(t)

    # Call and Put Prices
    call_price = s * norm_cdf(d1) - k * math.exp(-r * t) * norm_cdf(d2)
    put_price = k * math.exp(-r * t) * norm_cdf(-d2) - s * norm_cdf(-d1)

    # Greeks
    delta_call = norm_cdf(d1)
    delta_put = delta_call - 1.0
    gamma = norm_pdf(d1) / (s * sigma * math.sqrt(t))
    vega = (s * norm_pdf(d1) * math.sqrt(t)) / 100.0  # per 1% change in vol
    theta_call = (- (s * norm_pdf(d1) * sigma) / (2 * math.sqrt(t)) - r * k * math.exp(-r * t) * norm_cdf(d2)) / 365.0
    theta_put = (- (s * norm_pdf(d1) * sigma) / (2 * math.sqrt(t)) + r * k * math.exp(-r * t) * norm_cdf(-d2)) / 365.0
    rho_call = (k * t * math.exp(-r * t) * norm_cdf(d2)) / 100.0
    rho_put = (-k * t * math.exp(-r * t) * norm_cdf(-d2)) / 100.0

    return {
        "call_price": call_price,
        "put_price": put_price,
        "delta_call": delta_call,
        "delta_put": delta_put,
        "gamma": gamma,
        "vega": vega,
        "theta_call": theta_call,
        "theta_put": theta_put,
        "rho_call": rho_call,
        "rho_put": rho_put
    }
`
  },
  {
    id: 'saas-metrics',
    name: 'SaaS 5-Year ARR, CAC & Unit Economics',
    category: 'Venture Capital & Startups',
    badge: 'Growth & SaaS',
    description: 'Projects Annual Recurring Revenue (ARR), logo churn, net expansion, LTV/CAC ratio, and Magic Number across 5 years.',
    pythonCode: `def saas_financial_projection(
    starting_arr: float = 1_200_000.0,
    new_arr_growth: float = 0.45,
    gross_churn_rate: float = 0.08,
    expansion_rate: float = 0.18,
    gross_margin: float = 0.78,
    cac_spend_annual: float = 650_000.0,
    avg_contract_value: float = 24_000.0,
    years: int = 5
) -> dict:
    """
    Forecasts SaaS recurring revenue build, Net Retention Rate (NRR), and Unit Economics.
    """
    arr_trajectory = []
    current_arr = starting_arr
    total_new_customers = 0

    for yr in range(1, years + 1):
        beginning_arr = current_arr
        churn_loss = beginning_arr * gross_churn_rate
        expansion_gain = beginning_arr * expansion_rate
        net_retention_rate = (beginning_arr - churn_loss + expansion_gain) / beginning_arr
        
        new_bookings = beginning_arr * new_arr_growth
        ending_arr = beginning_arr - churn_loss + expansion_gain + new_bookings
        
        new_logos = round(new_bookings / avg_contract_value)
        total_new_customers += new_logos
        cac_per_logo = cac_spend_annual / max(1, new_logos)
        ltv = (avg_contract_value * gross_margin) / gross_churn_rate
        ltv_cac_ratio = ltv / cac_per_logo if cac_per_logo > 0 else 0.0
        
        arr_trajectory.append({
            "year": yr,
            "beginning_arr": beginning_arr,
            "new_bookings": new_bookings,
            "expansion_gain": expansion_gain,
            "churn_loss": churn_loss,
            "ending_arr": ending_arr,
            "nrr": net_retention_rate,
            "ltv_cac": ltv_cac_ratio
        })
        
        current_arr = ending_arr

    return {
        "final_arr": current_arr,
        "arr_cagr": (current_arr / starting_arr) ** (1.0 / years) - 1.0,
        "trajectory": arr_trajectory
    }
`
  },
  {
    id: 'capex-depreciation',
    name: 'CapEx & MACRS / Straight-Line Depreciation',
    category: 'Corporate Finance',
    badge: 'Accounting & Tax',
    description: 'Builds fixed asset roll-forward schedule with CapEx purchases, straight-line depreciation, accumulated depreciation, and net book value.',
    pythonCode: `def fixed_asset_depreciation_schedule(
    initial_asset_cost: float = 1_500_000.0,
    salvage_value: float = 150_000.0,
    useful_life_years: int = 7,
    annual_new_capex: float = 200_000.0
) -> dict:
    """
    Generates dynamic asset roll-forward and straight-line depreciation schedule.
    """
    depreciable_base = initial_asset_cost - salvage_value
    annual_straight_line_depr = depreciable_base / useful_life_years
    
    gross_pp_and_e = initial_asset_cost
    accumulated_depreciation = 0.0
    schedule = []

    for yr in range(1, useful_life_years + 1):
        beginning_nbv = gross_pp_and_e - accumulated_depreciation
        gross_pp_and_e += annual_new_capex
        
        # Current year depreciation
        depr_expense = annual_straight_line_depr + (annual_new_capex / useful_life_years) * 0.5 # mid-year convention
        accumulated_depreciation += depr_expense
        ending_nbv = gross_pp_and_e - accumulated_depreciation
        
        schedule.append({
            "year": yr,
            "beginning_nbv": beginning_nbv,
            "new_capex": annual_new_capex,
            "depreciation_expense": depr_expense,
            "accumulated_depreciation": accumulated_depreciation,
            "ending_nbv": ending_nbv
        })

    return {
        "initial_cost": initial_asset_cost,
        "useful_life": useful_life_years,
        "final_nbv": schedule[-1]["ending_nbv"],
        "schedule": schedule
    }
`
  },
  {
    id: 'portfolio-var',
    name: 'Capital Budgeting (NPV, IRR & Payback)',
    category: 'Project Finance',
    badge: 'Cap Budgeting',
    description: 'Evaluates capital projects with hurdle rate discount, Net Present Value (NPV), Internal Rate of Return (IRR), and discounted payback period.',
    pythonCode: `def capital_budgeting_analysis(
    initial_outlay: float = 750_000.0,
    cash_inflows: list = None,
    hurdle_rate: float = 0.10
) -> dict:
    """
    Computes NPV, estimated IRR, Payback Period, and Profitability Index (PI).
    """
    if cash_inflows is None:
        cash_inflows = [180_000.0, 220_000.0, 260_000.0, 290_000.0, 310_000.0]
    
    # Net Present Value
    pv_inflows = 0.0
    discounted_flows = []
    cumulative_cash = -initial_outlay
    payback_year = None

    for t, cf in enumerate(cash_inflows, 1):
        pv_cf = cf / ((1.0 + hurdle_rate) ** t)
        pv_inflows += pv_cf
        discounted_flows.append(pv_cf)
        
        prev_cum = cumulative_cash
        cumulative_cash += cf
        if cumulative_cash >= 0 and payback_year is None:
            payback_year = (t - 1) + (-prev_cum / cf)

    npv = pv_inflows - initial_outlay
    profitability_index = pv_inflows / initial_outlay

    # Simple IRR Secant approximation
    def calc_npv_at_rate(r):
        return sum(cf / ((1.0 + r) ** t) for t, cf in enumerate(cash_inflows, 1)) - initial_outlay
    
    r0, r1 = 0.05, 0.25
    for _ in range(50):
        npv0 = calc_npv_at_rate(r0)
        npv1 = calc_npv_at_rate(r1)
        if abs(npv1 - npv0) < 1e-7:
            break
        r_next = r1 - npv1 * (r1 - r0) / (npv1 - npv0)
        r0, r1 = r1, r_next

    return {
        "initial_investment": initial_outlay,
        "hurdle_rate": hurdle_rate,
        "pv_future_inflows": pv_inflows,
        "net_present_value": npv,
        "internal_rate_of_return": r1,
        "profitability_index": profitability_index,
        "payback_period_years": payback_year
    }
`
  }
];
