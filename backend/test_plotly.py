import plotly.express as px
import plotly.graph_objects as go

captured_figs = []

# Cache original
_original_show = go.Figure.show

# Mock
def mock_show(self, *args, **kwargs):
    captured_figs.append(self)

go.Figure.show = mock_show

def some_function():
    df = px.data.tips()
    fig = px.histogram(df, x="total_bill")
    fig.show()

some_function()

print("Captured figures:", len(captured_figs))
if captured_figs:
    print("Is figure?", isinstance(captured_figs[0], go.Figure))

# Restore
go.Figure.show = _original_show
