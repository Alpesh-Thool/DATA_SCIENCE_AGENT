import pandas as pd

df = pd.DataFrame({'a': [1,2,3]})

code = """
print(df.head())
"""

exec_globals = {"pd": pd, "df": df.copy()}
exec_locals = {}

try:
    exec(code, exec_globals, exec_locals)
except Exception as e:
    import traceback
    print(traceback.format_exc())
