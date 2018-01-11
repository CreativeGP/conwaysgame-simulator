import copy
import sys
sample = [0, 0, 0,
          0, 1, 0,
          0, 0, 0]

def to_num(sample):
    res = 0
    for i in xrange(9):
        res += sample[i] * (1 << i)
    return res

def calculate(sample):
    surrounds = [
        sample[1]+sample[3]+sample[4],
        sample[0]+sample[2]+sample[3]+sample[4]+sample[5],
        sample[1]+sample[4]+sample[5],
        sample[0]+sample[1]+sample[4]+sample[7]+sample[6],
        sample[0]+sample[1]+sample[2]+sample[3]+sample[5]+sample[6]+sample[7]+sample[8],
        sample[1]+sample[2]+sample[4]+sample[7]+sample[8],
        sample[3]+sample[4]+sample[7],
        sample[3]+sample[4]+sample[5]+sample[6]+sample[8],
        sample[4]+sample[5]+sample[7]
    ]

    print(surrounds)

    for i in xrange(9):
        state = sample[i]
        su = surrounds[i]
        if state == 0 and su == 3: sample[i] = 1
        if state == 1:
            if su == 2 or su == 3: continue
            if su <= 1 or su >= 4: sample[i] = 0
    return sample

print(calculate([0, 0, 0, 0, 1, 1, 0, 0, 0]))

# print('{')
# for a in xrange(2):
#     sample[0] = a
#     for b in xrange(2):
#         sample[1] = b
#         for c in xrange(2):
#             sample[2] = c
#             for d in xrange(2):
#                 sample[3] = d
#                 for e in xrange(2):
#                     sample[4] = e
#                     for f in xrange(2):
#                         sample[5] = f
#                         for g in xrange(2):
#                             sample[6] = g
#                             for h in xrange(2):
#                                 sample[7] = h
#                                 for i in xrange(2):
#                                     sample[8] = i
#                                     sys.stdout.write("%d: %d," % (to_num(sample), to_num(calculate(copy.copy(sample)))))

# print('};')
