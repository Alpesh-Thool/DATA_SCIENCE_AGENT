code = """
print(df.head())
"""

exec_globals = {}
exec_locals = {}

try:
    exec(code, exec_globals, exec_locals)
except Exception as e:
    import traceback
    print("Caught:", repr(e))
