
alias math-gen-matrix='python3 ${MATH_PLAYGROUND_DIR}/mathtools/matrix/gen_matrix.py'

if [ -z "$MATH_PLAYGROUND_PYTHON_PATH" ]
then
    export MATH_PLAYGROUND_PYTHON_PATH=$MATH_PLAYGROUND_DIR/
    export PYTHONPATH=$MATH_PLAYGROUND_PYTHON_PATH:$PYTHONPATH
fi
