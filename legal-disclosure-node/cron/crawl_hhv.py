import json
import sys
from contextlib import redirect_stdout, redirect_stderr
from io import StringIO

from vnstock.api.quote import Quote

quote = Quote(symbol='HHV', source='VCI')

buffer = StringIO()
with redirect_stdout(buffer), redirect_stderr(buffer):
    df = quote.history(
        symbol='HHV',
        start='2025-01-01',
        end='2026-06-29',
        interval='D',
    )

if 'time' in df.columns and hasattr(df['time'], 'dt'):
    df['time'] = df['time'].dt.strftime('%Y-%m-%d')
elif 'time' in df.columns:
    df['time'] = df['time'].astype(str)

result = df.to_dict(orient='records')
sys.stdout.write(json.dumps(result, ensure_ascii=False))