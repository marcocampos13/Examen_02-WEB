// ========================================
// RUTAS DE ESTADÍSTICAS
// ========================================

const express = require('express');
const Research = require('../models/Research');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Question = require('../models/Question');

const router = express.Router();

// ========================================
// GET /api/stats - Obtener estadísticas generales del sistema
// ========================================
router.get('/', async (req, res) => {
  try {
    // Obtener conteos básicos
    const [
      totalResearches,
      totalUsers,
      totalComments,
      totalQuestions
    ] = await Promise.all([
      Research.countDocuments({ status: 'published' }),
      User.countDocuments({ isActive: true }),
      Comment.countDocuments({ status: 'approved' }),
      Question.countDocuments()
    ]);

    // Estadísticas por área de interés
    const researchesByArea = await Research.aggregate([
      { $match: { status: 'published' } },
      {
        $group: {
          _id: '$areaOfInterest',
          count: { $sum: 1 },
          avgRating: { $avg: '$averageRating' },
          totalViews: { $sum: '$views' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Estadísticas por grado escolar
    const usersByGrade = await User.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$schoolGrade',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Top 5 investigaciones más vistas
    const topViewedResearches = await Research.find({ status: 'published' })
      .populate('author', 'fullName schoolGrade')
      .select('title areaOfInterest views averageRating totalComments')
      .sort({ views: -1 })
      .limit(5);

    // Top 5 investigaciones mejor calificadas
    const topRatedResearches = await Research.find({ 
      status: 'published',
      totalComments: { $gte: 1 } // Al menos 1 comentario
    })
    .populate('author', 'fullName schoolGrade')
    .select('title areaOfInterest views averageRating totalComments')
    .sort({ averageRating: -1, totalComments: -1 })
    .limit(5);

    // Estadísticas de actividad reciente (últimos 30 días)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const recentActivity = await Promise.all([
      Research.countDocuments({ 
        status: 'published',
        createdAt: { $gte: thirtyDaysAgo } 
      }),
      User.countDocuments({ 
        isActive: true,
        createdAt: { $gte: thirtyDaysAgo } 
      }),
      Comment.countDocuments({ 
        status: 'approved',
        createdAt: { $gte: thirtyDaysAgo } 
      }),
      Question.countDocuments({ 
        createdAt: { $gte: thirtyDaysAgo } 
      })
    ]);

    // Estadísticas de calificaciones
    const ratingDistribution = await Comment.aggregate([
      { $match: { status: 'approved' } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Usuarios más activos (con más investigaciones)
    const topAuthors = await Research.aggregate([
      { $match: { status: 'published' } },
      {
        $group: {
          _id: '$author',
          researchCount: { $sum: 1 },
          totalViews: { $sum: '$views' },
          avgRating: { $avg: '$averageRating' }
        }
      },
      { $sort: { researchCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'author'
        }
      },
      { $unwind: '$author' },
      {
        $project: {
          _id: 1,
          researchCount: 1,
          totalViews: 1,
          avgRating: { $round: ['$avgRating', 1] },
          'author.fullName': 1,
          'author.schoolGrade': 1
        }
      }
    ]);

    res.json({
      success: true,
      message: 'Estadísticas obtenidas exitosamente',
      data: {
        overview: {
          totalResearches,
          totalUsers,
          totalComments,
          totalQuestions,
          lastUpdated: new Date().toISOString()
        },
        
        byArea: {
          researches: researchesByArea,
          totalAreas: researchesByArea.length
        },
        
        byGrade: {
          users: usersByGrade,
          totalGrades: usersByGrade.length
        },
        
        topContent: {
          mostViewed: topViewedResearches,
          bestRated: topRatedResearches,
          topAuthors: topAuthors
        },
        
        recentActivity: {
          period: 'Últimos 30 días',
          newResearches: recentActivity[0],
          newUsers: recentActivity[1],
          newComments: recentActivity[2],
          newQuestions: recentActivity[3]
        },
        
        engagement: {
          ratingDistribution: ratingDistribution,
          avgCommentsPerResearch: totalResearches > 0 ? 
            Math.round((totalComments / totalResearches) * 10) / 10 : 0,
          avgQuestionsPerResearch: totalResearches > 0 ? 
            Math.round((totalQuestions / totalResearches) * 10) / 10 : 0
        }
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error obteniendo las estadísticas'
    });
  }
});

// ========================================
// GET /api/stats/area/:areaName - Estadísticas específicas de un área
// ========================================
router.get('/area/:areaName', async (req, res) => {
  try {
    const { areaName } = req.params;
    
    // Validar área
    const validAreas = ['español', 'matemáticas', 'ciencias', 'estudios sociales'];
    const normalizedArea = areaName.toLowerCase().trim();
    
    if (!validAreas.includes(normalizedArea)) {
      return res.status(400).json({
        error: 'Área inválida',
        message: 'El área debe ser una de: español, matemáticas, ciencias, estudios sociales',
        validAreas
      });
    }

    // Estadísticas básicas del área
    const areaStats = await Research.aggregate([
      { $match: { areaOfInterest: normalizedArea, status: 'published' } },
      {
        $group: {
          _id: null,
          totalResearches: { $sum: 1 },
          totalViews: { $sum: '$views' },
          totalComments: { $sum: '$totalComments' },
          avgRating: { $avg: '$averageRating' },
          maxRating: { $max: '$averageRating' },
          minRating: { $min: '$averageRating' }
        }
      }
    ]);

    // Investigaciones del área por grado
    const researchesByGrade = await Research.aggregate([
      { $match: { areaOfInterest: normalizedArea, status: 'published' } },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author'
        }
      },
      { $unwind: '$author' },
      {
        $group: {
          _id: '$author.schoolGrade',
          count: { $sum: 1 },
          avgRating: { $avg: '$averageRating' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Top investigaciones del área
    const topResearches = await Research.find({ 
      areaOfInterest: normalizedArea, 
      status: 'published' 
    })
    .populate('author', 'fullName schoolGrade')
    .select('title views averageRating totalComments createdAt')
    .sort({ averageRating: -1, views: -1 })
    .limit(10);

    const stats = areaStats[0] || {
      totalResearches: 0,
      totalViews: 0,
      totalComments: 0,
      avgRating: 0,
      maxRating: 0,
      minRating: 0
    };

    res.json({
      success: true,
      message: `Estadísticas del área "${normalizedArea}" obtenidas exitosamente`,
      data: {
        area: normalizedArea,
        overview: {
          ...stats,
          avgRating: Math.round(stats.avgRating * 10) / 10
        },
        byGrade: researchesByGrade,
        topResearches: topResearches
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas del área:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error obteniendo las estadísticas del área'
    });
  }
});

// ========================================
// GET /api/stats/trends - Tendencias y análisis temporal
// ========================================
router.get('/trends', async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    // Calcular fechas según el período
    let days = 30;
    switch (period) {
      case '7d': days = 7; break;
      case '30d': days = 30; break;
      case '90d': days = 90; break;
      case '1y': days = 365; break;
      default: days = 30;
    }

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Tendencia de investigaciones por día
    const researchTrends = await Research.aggregate([
      { 
        $match: { 
          status: 'published',
          createdAt: { $gte: startDate } 
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          areas: { $push: '$areaOfInterest' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Tendencia de usuarios registrados
    const userTrends = await User.aggregate([
      { 
        $match: { 
          isActive: true,
          createdAt: { $gte: startDate } 
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Tendencia de participación (comentarios + preguntas)
    const [commentTrends, questionTrends] = await Promise.all([
      Comment.aggregate([
        { 
          $match: { 
            status: 'approved',
            createdAt: { $gte: startDate } 
          } 
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        }
      ]),
      Question.aggregate([
        { 
          $match: { 
            createdAt: { $gte: startDate } 
          } 
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      message: `Tendencias de ${period} obtenidas exitosamente`,
      data: {
        period: period,
        dateRange: {
          from: startDate.toISOString().split('T')[0],
          to: new Date().toISOString().split('T')[0]
        },
        trends: {
          researches: researchTrends,
          users: userTrends,
          comments: commentTrends,
          questions: questionTrends
        }
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo tendencias:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error obteniendo las tendencias'
    });
  }
});

module.exports = router;