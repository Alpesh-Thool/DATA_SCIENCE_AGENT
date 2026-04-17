code = """
import sys
x = 10
def foo():
    pass
"""

exec_globals = {"sys": __import__("sys")}
exec_locals = {}

exec(code, exec_globals, exec_locals)

print("Globals keys:", exec_globals.keys())
print("Locals keys:", exec_locals.keys())
