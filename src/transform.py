import numpy as np

def getTranslationMatrix(T):
    '''
        getTranslationMatrix(T)
            T : 3-sized vector
    '''
    np.array(
             [[1, 0, 0, T.x],
              [0, 1, 0, T.y],
              [0, 0, 1, T.z],
              [0, 0, 0, 1]]
              );