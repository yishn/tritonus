const assert = require('assert')
const t = require('../index')

describe('Tonality', function() {
    describe('constructor', function() {
        it('should parse notation', function() {
            assert(t.equals(t("d e fis g"), t([2, 4, 6, 7])))
            assert(t.equals(t("d es f g as"), t([2, 3, 5, 7, 8])))
            assert(t.equals(t("d dis f ges gis"), t([2, 3, 5, 6, 8])))
            assert(t.equals(t("d' es, f,' g'' as"), t([14, -9, 5, 31, 8])))
        })
        it('should accept number values', function() {
            assert(t.equals(t(5), t([5])))
        })
        it('should be idempotent', function() {
            assert(t.equals(t(t([0, 5, 10])), t([0, 5, 10])))
        })
        it('should not distinguish enharmonic equivalents', function() {
            assert(t.equals(t("dis"), t("es")))
            assert(t.equals(t("disis"), t("e")))
            assert(t.equals(t("d"), t("eses")))
            assert(t.equals(t("g"), t("ases")))
        })
        it('should detect invalid notes', function() {
            assert.throws(() => t([0, 0.5, 1, 1.3]))
            assert.throws(() => t([0, 'blah', 1]))
        })
    })

    describe('transpose', function() {
        it('should work', function() {
            assert(t.equals(
                t([0, 1, 2, 3, 4, 5, 6, 7, 8]).transpose(2),
                t([2, 3, 4, 5, 6, 7, 8, 9, 10])
            ))
        })
        it('should not mutate object', function() {
            let scale = t([0, 1, 2, 3, 4, 5, 6, 7, 8])
            scale.transpose(2)
            assert(t.equals(scale, t([0, 1, 2, 3, 4, 5, 6, 7, 8])))
        })
    })

    describe('reverse', function() {
        it('should work', function() {
            assert(t.equals(
                t([0, 1, 2, 3, 4, 5, 6, 7, 8]).reverse(),
                t([8, 7, 6, 5, 4, 3, 2, 1, 0])
            ))
        })
        it('should not mutate object', function() {
            let scale = t([0, 1, 2, 3, 4, 5, 6, 7, 8])
            scale.reverse()
            assert(t.equals(scale, t([0, 1, 2, 3, 4, 5, 6, 7, 8])))
        })
    })

    describe('render', function() {
        let scale = t([0, 2, 4, 5, 7, 9, 11])

        it('should return right notes', function() {
            assert.equal(
                scale.render(),
                'c d e f g a b'
            )
        })
        it('should return right octave', function() {
            assert.equal(
                scale.transpose(12).render(),
                "c' d' e' f' g' a' b'"
            )
            assert.equal(
                scale.transpose(-24).render(),
                "c,, d,, e,, f,, g,, a,, b,,"
            )
        })
        it('should get accidentals right', function() {
            assert.equal(
                scale.transpose(2).render('d'),
                "d e fis g a b cis'"
            )
            assert.equal(
                scale.transpose(-2).render('bes'),
                'bes, c d es f g a'
            )
            assert.equal(
                scale.transpose(-2).render('gm'),
                'bes, c d es f g a'
            )
        })
    })

    describe('interval2semitones', function() {
        it('should handle perfect intervals', function() {
            assert.equal(t.interval2semitones('P1'), 0)
            assert.equal(t.interval2semitones('P4'), 5)
            assert.equal(t.interval2semitones('P5'), 7)
            assert.equal(t.interval2semitones('P8'), 12)
            assert.equal(t.interval2semitones('P11'), 17)

            assert.equal(t.interval2semitones('1'), 0)
            assert.equal(t.interval2semitones('4'), 5)
            assert.equal(t.interval2semitones('5'), 7)
            assert.equal(t.interval2semitones('8'), 12)
            assert.equal(t.interval2semitones('11'), 17)
        })
        it('should handle minor/major intervals', function() {
            assert.equal(t.interval2semitones('m2'), 1)
            assert.equal(t.interval2semitones('M2'), 2)
            assert.equal(t.interval2semitones('m7'), 10)
            assert.equal(t.interval2semitones('M7'), 11)
            assert.equal(t.interval2semitones('m16'), 25)
        })
        it('should handle dimished/augmented intervals', function() {
            assert.equal(t.interval2semitones('A2'), 3)
            assert.equal(t.interval2semitones('d3'), 2)
            assert.equal(t.interval2semitones('d8'), 11)
            assert.equal(t.interval2semitones('A5'), 8)
            assert.equal(t.interval2semitones('d14'), 21)
            assert.equal(t.interval2semitones('A7'), 12)
        })
        it('should handle negative intervals', function() {
            assert.equal(t.interval2semitones('-P4'), -5)
            assert.equal(t.interval2semitones('-m7'), -10)
            assert.equal(t.interval2semitones('-A5'), -8)
            assert.equal(t.interval2semitones('-d14'), -21)
        })
        it('should handle tritone', function() {
            assert.equal(t.interval2semitones('TT'), 6)
            assert.equal(t.interval2semitones('TT'), t.interval2semitones('d5'))
            assert.equal(t.interval2semitones('TT'), t.interval2semitones('A4'))
            assert.equal(t.interval2semitones('-TT'), -6)
        })
    })

    describe('getSemitones', function() {
        it('should work', function() {
            assert.equal(t.getSemitones('c', 'd'), 2)
            assert.equal(t.getSemitones('c', "c'"), 12)
            assert.equal(t.getSemitones('c', "c,"), -12)
            assert.equal(t.getSemitones('fis', "c"), -6)
        })
    })

    describe('getAccidentals', function() {
        it('should return empty list for c', function() {
            assert.deepEqual(t.getAccidentals('c'), [])
        })
        it('should return right number of sharps', function() {
            assert.equal(t.getAccidentals('h').length, 5)
        })
        it('should return right number of flats', function() {
            assert.equal(t.getAccidentals('ges').length, 6)
        })
    })

    describe('getDualKey', function() {
        it('should return correct minor key', function() {
            assert.equal(t.getDualKey('c'), 'am')
            assert.equal(t.getDualKey('d'), 'bm')
            assert.equal(t.getDualKey('e'), 'cism')
        })
        it('should return correct major key', function() {
            assert.equal(t.getDualKey('cm'), 'es')
            assert.equal(t.getDualKey('dm'), 'f')
            assert.equal(t.getDualKey('desm'), 'e')
        })
    })

    describe('getScale', function() {
        it('should return major scale', function() {
            assert.equal(t.getScale('c,').render('c,'), 'c, d, e, f, g, a, b,')
            assert.equal(t.getScale('d,').render('d,'), 'd, e, fis, g, a, b, cis')
        })
        it('should return natural minor scale', function() {
            assert.equal(t.getScale('c,m').render('c,m'), 'c, d, es, f, g, as, bes,')
            assert.equal(t.getScale('d,m').render('d,m'), 'd, e, f, g, a, bes, c')
        })
        it('should handle scale shifts', function() {
            assert.equal(t.getScale('c,m', 1).render('c,m'), 'd, es, f, g, as, bes, c')
            assert.equal(t.getScale("d'm", -2).render('d,m'), "bes c' d' e' f' g' a'")
        })
    })

    describe('getChord', function(){
        it('should return major chord', function() {
            assert.equal(t.getChord('c').render('c'), 'c e g')
            assert.equal(t.getChord('a,').render('a'), 'a, cis e')
        })
        it('should return minor chord', function() {
            assert.equal(t.getChord('cm').render('cm'), 'c es g')
            assert.equal(t.getChord('a,m').render('am'), 'a, c e')
        })
        it('should handle shifts', function() {
            assert.equal(t.getChord('cm', 1).render('cm'), "es g c'")
            assert.equal(t.getChord('a,m', -2).render('am'), 'c, e, a,')
        })
    })
})
