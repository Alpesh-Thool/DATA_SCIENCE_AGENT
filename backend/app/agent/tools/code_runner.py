"""
Secure-ish Python Code Runner tool for MVP Phase 2.
Executes pandas and plotly code locally in memory.
In Phase 3 this will be replaced with Jupyter Kernel Gateway.
"""

import sys
import io
import json
import traceback
import pandas as pd

from app.services.file_service import file_service


def run_python_code(file_id: str, code: str) -> dict:
    """
    Executes a block of python code. 
    It injects the specific dataframe `df` into the globals.
    Catches stdout and extracts any plotly figure assigned to the `fig` variable.
    """
    # 1. Get the dataframe
    df = file_service.get_dataframe(file_id)
    if df is None:
        return {
            "success": False,
            "stdout": "",
            "stderr": "Error: DataFrame not found in memory. Cannot execute code.",
            "error": "DataFrame not found",
            "visualizations": []
        }

    # 2. Setup execution environment
    # We provide a clean globals dict with pandas and the dataframe injected.
    exec_globals = {
        "pd": pd,
        "df": df.copy(), # Provide a copy so they don't break the base dataframe
        # Inject standard modules they might need (like numpy if available)
    }
    
    # We will try to pre-import plotly.express to make it easier for the model
    try:
        import plotly.express as px
        exec_globals["px"] = px
    except ImportError:
        pass

    # 3. Capture Stdout/Stderr
    old_stdout = sys.stdout
    old_stderr = sys.stderr
    captured_stdout = io.StringIO()
    captured_stderr = io.StringIO()
    sys.stdout = captured_stdout
    sys.stderr = captured_stderr

    success = True
    error_msg = None
    exec_locals = {}

    # 4. Execute
    try:
        exec(code, exec_globals, exec_locals)
    except Exception as e:
        success = False
        error_msg = traceback.format_exc()
        print(f"🚨 [CodeRunner] EXEC ERROR:\n{error_msg}")
        print(f"🚨 [CodeRunner] FAILED CODE:\n{code}")

    # 5. Restore Stdout/Stderr
    sys.stdout = old_stdout
    sys.stderr = old_stderr

    stdout_str = captured_stdout.getvalue()
    stderr_str = captured_stderr.getvalue()

    # 6. Extract visualizations
    visualizations = []
    
    # Check if a variable named 'fig' was created and is a plotly figure
    if "fig" in exec_locals:
        fig = exec_locals["fig"]
        # Basic duck-typing check for plotly figure
        if hasattr(fig, "to_json"):
            try:
                fig_json = json.loads(fig.to_json())
                visualizations.append({
                    "title": "Visualization", # Will be updated by evaluator if needed
                    "chart_type": "plotly",
                    "plotly_json": fig_json
                })
            except Exception as fig_err:
                stderr_str += f"\nError converting figure to JSON: {str(fig_err)}"

    return {
        "success": success,
        "stdout": stdout_str,
        "stderr": stderr_str,
        "error": error_msg,
        "visualizations": visualizations
    }
