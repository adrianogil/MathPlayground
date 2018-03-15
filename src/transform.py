import numpy as np

def getTranslationMatrix(T):
    '''
        getTranslationMatrix(T)
            T : 3-sized vector
    '''
    return np.array(
             [[1, 0, 0, T.x],
              [0, 1, 0, T.y],
              [0, 0, 1, T.z],
              [0, 0, 0, 1]]
              )

def getOrientationMatrixX(theta):
    return np.array(
             [[1, 0, 0, 0],
              [0, np.cos(theta), -np.sin(theta), 0],
              [0, np.sin(theta), np.cos(theta), 0],
              [0, 0, 0, 1]]
              )

def getOrientationMatrixY(theta):
    return np.array(
             [[np.cos(theta), 0, np.sin(theta), 0],
              [0, 1, 0, 0],
              [-np.sin(theta), 0, np.cos(theta), 0],
              [0, 0, 0, 1]]
              )

def getOrientationMatrixZ(theta):
    return np.array(
             [[np.cos(theta), -np.sin(theta), 0, 0],
              [np.sin(theta), np.cos(theta), 0, 0],
              [0, 0, 1, 0],
              [0, 0, 0, 1]]
              )